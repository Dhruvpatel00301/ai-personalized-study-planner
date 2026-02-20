export const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

export const todayLabel = () => new Date().toLocaleDateString();

