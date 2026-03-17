import { useEffect } from "react";

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const base =
    "fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-xl px-4 py-2 text-sm font-semibold shadow-soft";
  const styles =
    type === "error"
      ? "bg-red-100 text-red-700 border border-red-200"
      : "bg-emerald-100 text-emerald-700 border border-emerald-200";

  return <div className={`${base} ${styles}`}>{message}</div>;
}

export default Toast;
