import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureDatasetExists, loadCsv, runCausalAnalysis } from '../services/causalService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testCsvPath = path.join(__dirname, 'test_causal_experiment.csv');

test('Causal Inference Module tests', async (t) => {
  // Cleanup test CSV if it exists
  if (fs.existsSync(testCsvPath)) {
    fs.unlinkSync(testCsvPath);
  }

  await t.test('ensureDatasetExists creates the CSV file with correct headers and count', () => {
    ensureDatasetExists(testCsvPath);
    assert.ok(fs.existsSync(testCsvPath), 'CSV file should be created');

    const content = fs.readFileSync(testCsvPath, 'utf8');
    const lines = content.trim().split('\n');
    
    // Header check
    assert.equal(lines[0], 'task_id,ai_assisted,task_difficulty,developer_experience,language,task_type,completion_time');
    
    // 200 data lines + 1 header line = 201 lines total
    assert.equal(lines.length, 201, 'CSV should contain exactly 200 observation rows');
  });

  await t.test('loadCsv correctly parses the CSV observations', () => {
    const data = loadCsv(testCsvPath);
    assert.equal(data.length, 200);

    const first = data[0];
    assert.ok(first.task_id);
    assert.ok(typeof first.ai_assisted === 'number');
    assert.ok(first.ai_assisted === 0 || first.ai_assisted === 1);
    assert.ok(typeof first.task_difficulty === 'number');
    assert.ok(typeof first.developer_experience === 'number');
    assert.ok(typeof first.completion_time === 'number');
    assert.ok(typeof first.language === 'string');
    assert.ok(typeof first.task_type === 'string');
  });

  await t.test('runCausalAnalysis calculates correct metrics and handles confounding', () => {
    const result = runCausalAnalysis(testCsvPath);

    // Verify correct properties in response
    assert.equal(result.experiment_type, 'synthetic');
    assert.equal(result.data_source, 'synthetic');
    assert.equal(result.treatment, 'AI assistance');
    assert.equal(result.outcome, 'task completion time');
    assert.equal(result.method, 'Propensity Score Matching');
    assert.equal(result.sample_size, 200);
    assert.ok(result.treated_count > 0);
    assert.ok(result.control_count > 0);
    assert.ok(result.matched_pairs_count > 0);

    // Check that naive difference is mathematically different from the matched effect
    assert.ok(typeof result.naive_difference_minutes === 'number');
    assert.ok(typeof result.matched_effect_minutes === 'number');
    
    // Check that matched effect is close to the true effect of -8.0 minutes
    assert.ok(result.matched_effect_minutes < -6.0 && result.matched_effect_minutes > -10.0, 
      `Matched effect (${result.matched_effect_minutes}) should control for confounding and be close to -8.0`);

    // Check that naive difference is confounded (i.e. less negative than matched effect, due to task difficulty confounding)
    assert.ok(result.naive_difference_minutes > result.matched_effect_minutes,
      `Naive difference (${result.naive_difference_minutes}) should be less negative than matched effect (${result.matched_effect_minutes}) due to positive difficulty bias`);

    assert.ok(Array.isArray(result.limitations));
    assert.equal(result.limitations.length, 3);
  });

  // Cleanup test file at the end
  if (fs.existsSync(testCsvPath)) {
    fs.unlinkSync(testCsvPath);
  }
});
