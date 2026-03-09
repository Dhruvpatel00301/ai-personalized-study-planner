const clampPercent = (value) => Math.max(0, Math.min(100, Math.round(value)));

const computeReadinessScore = ({ concept, practice, consistency }) => {
  const readiness = concept * 0.4 + practice * 0.35 + consistency * 0.25;
  return clampPercent(readiness);
};

module.exports = computeReadinessScore;
