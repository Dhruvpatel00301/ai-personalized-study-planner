import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center px-4">
      <form onSubmit={handleSubmit} className="surface-card w-full p-6">
        <p className="section-title">Welcome Back</p>
        <h1 className="text-xl font-bold text-brand-700">Sign in to your planner</h1>
        <p className="text-sm text-slate-500">Sign in to continue your study plan.</p>

        <div className="mt-4 space-y-3">
          <input
            className="field-input"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <input
            className="field-input"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
        </div>

        {error ? <p className="status-error mt-3">{error}</p> : null}

        <button type="submit" disabled={submitting} className="btn-primary mt-4">
          {submitting ? "Signing in..." : "Login"}
        </button>

        <p className="mt-3 text-center text-sm text-slate-500">
          New user? <Link to="/register" className="font-semibold text-brand-700">Create account</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;

