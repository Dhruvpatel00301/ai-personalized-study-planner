const templates = [
  "Progress compounds. A small focused session today protects your momentum.",
  "Missed tasks happen. Recover now with one intentional study block.",
  "Your exam date is fixed, but your preparation quality is still in your control.",
  "Consistency beats intensity. Complete your next task and rebuild your streak.",
];

const getMotivationalMessage = () => templates[Math.floor(Math.random() * templates.length)];

module.exports = {
  getMotivationalMessage,
};
