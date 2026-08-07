import { asyncHandler } from '../utils/asyncHandler.js';
import { runCausalAnalysisForUser } from '../services/causalService.js';

export const getAnalyticsCausal = asyncHandler(async (req, res) => {
  const result = await runCausalAnalysisForUser(req.user.uid);
  res.json({ data: result });
});
