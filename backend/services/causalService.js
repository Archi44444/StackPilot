import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CSV_PATH = path.join(__dirname, '../data/causal_experiment.csv');

// Seedable Linear Congruential Generator (LCG) for reproducible synthetic data
function createRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Ensures the synthetic causal experiment dataset is generated and saved to CSV.
 * Uses a fixed random seed for complete reproducibility.
 */
export function ensureDatasetExists(filePath = DEFAULT_CSV_PATH) {
  if (fs.existsSync(filePath)) {
    return;
  }
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const random = createRandom(42);
  const data = [];
  const languages = ['JavaScript', 'Python', 'Go', 'TypeScript'];
  const taskTypes = ['bug_fix', 'feature', 'refactor', 'docs'];

  for (let i = 1; i <= 200; i++) {
    const difficulty = Math.floor(random() * 5) + 1; // 1 to 5
    const exp = Math.floor(random() * 10) + 1; // 1 to 10
    const lang = languages[Math.floor(random() * languages.length)];
    const type = taskTypes[Math.floor(random() * taskTypes.length)];

    // Confounded treatment assignment:
    // Developers are more likely to seek AI assistance for higher difficulty tasks
    // and when they have less experience (junior developer assistance bias).
    const logit = -0.5 + 0.8 * (difficulty - 3) - 0.25 * (exp - 5.5);
    const prob = 1 / (1 + Math.exp(-logit));
    const aiAssisted = random() < prob ? 1 : 0;

    // Outcome: Completion Time in minutes.
    // True treatment effect: using AI reduces completion time by exactly 8 minutes.
    // Confounder effects:
    // - Higher difficulty adds 12 minutes per level.
    // - Higher experience reduces 2.5 minutes per year.
    // - Language and Task type have moderate variations.
    let time = 45.0;
    time += difficulty * 12.0;
    time -= exp * 2.5;

    if (lang === 'Go') time += 6.0;
    else if (lang === 'Python') time += 3.0;
    else if (lang === 'TypeScript') time += 1.0;

    if (type === 'docs') time -= 12.0;
    else if (type === 'feature') time += 18.0;
    else if (type === 'refactor') time += 8.0;

    if (aiAssisted === 1) {
      time -= 8.0; // The true causal effect (ATT)
    }

    // Noise parameter to simulate unobserved factors: uniform noise between -4 and +4 mins.
    const noise = (random() - 0.5) * 8.0;
    time += noise;

    data.push({
      task_id: `task_${i}`,
      ai_assisted: aiAssisted,
      task_difficulty: difficulty,
      developer_experience: exp,
      language: lang,
      task_type: type,
      completion_time: Math.round(time * 10) / 10
    });
  }

  // Write to CSV format
  const header = 'task_id,ai_assisted,task_difficulty,developer_experience,language,task_type,completion_time\n';
  const rows = data
    .map((r) => `${r.task_id},${r.ai_assisted},${r.task_difficulty},${r.developer_experience},${r.language},${r.task_type},${r.completion_time}`)
    .join('\n');

  fs.writeFileSync(filePath, header + rows, 'utf8');
}

/**
 * Loads and parses the causal CSV dataset.
 */
export function loadCsv(filePath = DEFAULT_CSV_PATH) {
  ensureDatasetExists(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',');
    if (values.length < headers.length) continue;

    const row = {};
    for (let j = 0; j < headers.length; j++) {
      const val = values[j].trim();
      const num = Number(val);
      row[headers[j]] = isNaN(num) ? val : num;
    }
    data.push(row);
  }
  return data;
}

/**
 * Calculates statistical mean and standard deviation.
 */
function getStats(arr, key) {
  const values = arr.map((x) => x[key]);
  const n = values.length;
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
  const std = Math.sqrt(variance);
  return { mean, std };
}

/**
 * Extracts and encodes confounders into a standard feature vector (with intercept).
 * Performs feature standardization on continuous variables to guarantee stable gradient descent.
 */
function extractFeatures(obs, difficultyStats, experienceStats) {
  const diffStd = (obs.task_difficulty - difficultyStats.mean) / (difficultyStats.std || 1);
  const expStd = (obs.developer_experience - experienceStats.mean) / (experienceStats.std || 1);

  return [
    1.0, // Intercept / Bias
    diffStd,
    expStd,
    obs.language === 'Python' ? 1.0 : 0.0,
    obs.language === 'Go' ? 1.0 : 0.0,
    obs.language === 'TypeScript' ? 1.0 : 0.0,
    obs.task_type === 'feature' ? 1.0 : 0.0,
    obs.task_type === 'refactor' ? 1.0 : 0.0,
    obs.task_type === 'docs' ? 1.0 : 0.0,
  ];
}

/**
 * Trains a simple Logistic Regression model using batch Gradient Descent.
 */
function trainLogisticRegression(X, y) {
  const n = X.length;
  const m = X[0].length;
  let theta = new Array(m).fill(0);
  const lr = 0.2;
  const lambda = 0.01; // L2 Regularization parameter
  const epochs = 1500;

  for (let epoch = 0; epoch < epochs; epoch++) {
    const grads = new Array(m).fill(0);
    for (let i = 0; i < n; i++) {
      let z = 0;
      for (let j = 0; j < m; j++) {
        z += X[i][j] * theta[j];
      }
      const p = 1 / (1 + Math.exp(-z));
      const error = p - y[i];
      for (let j = 0; j < m; j++) {
        grads[j] += error * X[i][j];
      }
    }

    for (let j = 0; j < m; j++) {
      grads[j] /= n;
      if (j > 0) {
        grads[j] += (lambda / n) * theta[j];
      }
      theta[j] -= lr * grads[j];
    }
  }
  return theta;
}

/**
 * Computes propensity scores, matches groups, and estimates naive and causal treatment effects.
 */
export function runCausalAnalysis(filePath = DEFAULT_CSV_PATH) {
  const observations = loadCsv(filePath);
  const n = observations.length;

  if (n === 0) {
    throw new Error('Causal experiment dataset is empty.');
  }

  // 1. Gather stats for standardization
  const difficultyStats = getStats(observations, 'task_difficulty');
  const experienceStats = getStats(observations, 'developer_experience');

  // 2. Prepare Feature Matrix X and Label Vector y
  const X = [];
  const y = []; // Treatment indicator (ai_assisted)
  for (const obs of observations) {
    X.push(extractFeatures(obs, difficultyStats, experienceStats));
    y.push(obs.ai_assisted);
  }

  // 3. Train Logistic Regression model
  const theta = trainLogisticRegression(X, y);

  // 4. Calculate Propensity Score for each observation
  const propensityScores = [];
  for (let i = 0; i < n; i++) {
    let z = 0;
    for (let j = 0; j < theta.length; j++) {
      z += X[i][j] * theta[j];
    }
    const p = 1 / (1 + Math.exp(-z));
    propensityScores.push(p);
  }

  // 5. Partition into Treated and Control groups
  const treated = [];
  const control = [];
  for (let i = 0; i < n; i++) {
    const obs = observations[i];
    const score = propensityScores[i];
    const item = { ...obs, propensityScore: score, originalIndex: i };
    if (obs.ai_assisted === 1) {
      treated.push(item);
    } else {
      control.push(item);
    }
  }

  // Sort treated descending by propensity score to ensure deterministic ordering during matching
  treated.sort((a, b) => b.propensityScore - a.propensityScore);

  // 6. Perform 1:1 Nearest-Neighbor matching without replacement (using 0.25 caliper)
  const matchedPairs = [];
  const matchedControlIndices = new Set();
  const caliper = 0.05;

  for (const t of treated) {
    let bestControl = null;
    let minDiff = Infinity;

    for (const c of control) {
      if (matchedControlIndices.has(c.originalIndex)) continue;
      const diff = Math.abs(t.propensityScore - c.propensityScore);
      if (diff < minDiff) {
        minDiff = diff;
        bestControl = c;
      }
    }

    if (bestControl && minDiff <= caliper) {
      matchedPairs.push({ treated: t, control: bestControl });
      matchedControlIndices.add(bestControl.originalIndex);
    }
  }

  // 7. Calculate Naive Observational Difference
  const treatedTimes = treated.map((t) => t.completion_time);
  const controlTimes = control.map((c) => c.completion_time);

  const meanTreatedTime = treatedTimes.reduce((sum, v) => sum + v, 0) / (treatedTimes.length || 1);
  const meanControlTime = controlTimes.reduce((sum, v) => sum + v, 0) / (controlTimes.length || 1);
  const naiveDifference = meanTreatedTime - meanControlTime;

  // 8. Calculate Propensity-Matched Treatment Effect (ATT)
  let sumMatchedDiffs = 0;
  for (const pair of matchedPairs) {
    sumMatchedDiffs += (pair.treated.completion_time - pair.control.completion_time);
  }
  const matchedEffect = matchedPairs.length > 0 ? sumMatchedDiffs / matchedPairs.length : 0;

  // 9. Format response structure
  const sampleSize = n;
  const treatedCount = treated.length;
  const controlCount = control.length;
  const matchedCount = matchedPairs.length;

  const roundedNaive = Math.round(naiveDifference * 10) / 10;
  const roundedMatched = Math.round(matchedEffect * 10) / 10;

  return {
    experiment_type: 'synthetic',
    data_source: 'synthetic',
    treatment: 'AI assistance',
    outcome: 'task completion time',
    method: 'Propensity Score Matching',
    matching_rule: '1:1 nearest-neighbor matching without replacement (0.05 caliper)',
    sample_size: sampleSize,
    treated_count: treatedCount,
    control_count: controlCount,
    matched_pairs_count: matchedCount,
    naive_difference_minutes: roundedNaive,
    matched_effect_minutes: roundedMatched,
    interpretation: `AI-assisted tasks were estimated to take approximately ${Math.abs(roundedMatched)} fewer minutes after controlling for confounders via propensity-score matching.`,
    limitations: [
      'Synthetic demonstration data — log real tasks to unlock live results',
      'Estimate depends on observed confounders (difficulty, experience, language, type)',
      'This is not evidence from real StackPilot users'
    ]
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Real Firestore-backed analysis
// ─────────────────────────────────────────────────────────────────────────────

const MIN_TASKS_REQUIRED = 10;

/**
 * Runs propensity-score matching on real user task data from Firestore.
 * Returns null if there is insufficient data (< MIN_TASKS_REQUIRED, or
 * missing treatment or control observations).
 */
export async function runCausalAnalysisFromFirestore(uid) {
  // Import lazily to avoid circular dependencies and keep the CSV-only path fast.
  const { getDb } = await import('../config/firebaseAdmin.js');
  const db = getDb();

  const snapshot = await db.collection('tasks').where('uid', '==', uid).get();
  const observations = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      task_id: d.id,
      ai_assisted: data.ai_assisted,
      task_difficulty: data.task_difficulty,
      developer_experience: data.developer_experience,
      language: data.language,
      task_type: data.task_type,
      completion_time: data.completion_time,
    };
  });

  const n = observations.length;
  if (n < MIN_TASKS_REQUIRED) return null;

  const hasTreated = observations.some((o) => o.ai_assisted === 1);
  const hasControl = observations.some((o) => o.ai_assisted === 0);
  if (!hasTreated || !hasControl) return null;

  // Reuse the same statistical pipeline (standardisation, logistic regression, matching).
  const difficultyStats = getStats(observations, 'task_difficulty');
  const experienceStats = getStats(observations, 'developer_experience');

  const X = observations.map((obs) => extractFeatures(obs, difficultyStats, experienceStats));
  const y = observations.map((obs) => obs.ai_assisted);

  const theta = trainLogisticRegression(X, y);
  const propensityScores = X.map((row) => {
    let z = 0;
    for (let j = 0; j < theta.length; j++) z += row[j] * theta[j];
    return 1 / (1 + Math.exp(-z));
  });

  const treated = [];
  const control = [];
  for (let i = 0; i < n; i++) {
    const item = { ...observations[i], propensityScore: propensityScores[i], originalIndex: i };
    if (observations[i].ai_assisted === 1) treated.push(item);
    else control.push(item);
  }

  treated.sort((a, b) => b.propensityScore - a.propensityScore);

  const matchedPairs = [];
  const matchedControlIndices = new Set();
  const caliper = 0.05;

  for (const t of treated) {
    let bestControl = null;
    let minDiff = Infinity;
    for (const c of control) {
      if (matchedControlIndices.has(c.originalIndex)) continue;
      const diff = Math.abs(t.propensityScore - c.propensityScore);
      if (diff < minDiff) { minDiff = diff; bestControl = c; }
    }
    if (bestControl && minDiff <= caliper) {
      matchedPairs.push({ treated: t, control: bestControl });
      matchedControlIndices.add(bestControl.originalIndex);
    }
  }

  const meanTreatedTime = treated.reduce((s, x) => s + x.completion_time, 0) / (treated.length || 1);
  const meanControlTime = control.reduce((s, x) => s + x.completion_time, 0) / (control.length || 1);
  const naiveDifference = meanTreatedTime - meanControlTime;

  let sumDiffs = 0;
  for (const pair of matchedPairs) sumDiffs += pair.treated.completion_time - pair.control.completion_time;
  const matchedEffect = matchedPairs.length > 0 ? sumDiffs / matchedPairs.length : 0;

  const roundedNaive = Math.round(naiveDifference * 10) / 10;
  const roundedMatched = Math.round(matchedEffect * 10) / 10;
  const absEffect = Math.abs(roundedMatched);
  const direction = roundedMatched < 0 ? 'fewer' : 'more';

  return {
    experiment_type: 'live',
    data_source: 'real',
    treatment: 'AI assistance',
    outcome: 'task completion time',
    method: 'Propensity Score Matching',
    matching_rule: '1:1 nearest-neighbor matching without replacement (0.05 caliper)',
    sample_size: n,
    treated_count: treated.length,
    control_count: control.length,
    matched_pairs_count: matchedPairs.length,
    naive_difference_minutes: roundedNaive,
    matched_effect_minutes: roundedMatched,
    interpretation: `Based on your ${n} logged tasks, AI-assisted work took approximately ${absEffect} ${direction} minutes after propensity-score matching.`,
    limitations: [
      'Estimate depends on observed confounders only',
      `Based on ${n} self-reported tasks — results improve with more data`,
      'Larger samples yield more reliable treatment-effect estimates'
    ]
  };
}

/**
 * Unified entry-point used by the controller.
 * Attempts to run the analysis on real Firestore data for the given user.
 * If the user has insufficient real data, falls back to the synthetic CSV
 * and returns progress information so the UI can show a "Collecting data…" state.
 */
export async function runCausalAnalysisForUser(uid) {
  // Try real data first
  const realResult = await runCausalAnalysisFromFirestore(uid);
  if (realResult) return { ...realResult, tasks_logged: realResult.sample_size, tasks_required: MIN_TASKS_REQUIRED };

  // Count how many real tasks the user actually has (could be 0–9)
  const { getDb } = await import('../config/firebaseAdmin.js');
  const db = getDb();
  const snapshot = await db.collection('tasks').where('uid', '==', uid).get();
  const tasksLogged = snapshot.size;

  // Fall back to synthetic
  const syntheticResult = runCausalAnalysis();
  return { ...syntheticResult, tasks_logged: tasksLogged, tasks_required: MIN_TASKS_REQUIRED };
}

