const computeReadinessScore = ({ completion, weakCoverage, streakConsistency }) => {
  const readiness = completion * 0.5 + weakCoverage * 0.3 + streakConsistency * 0.2;
  return Math.max(0, Math.min(100, Math.round(readiness)));
};

module.exports = computeReadinessScore;
