import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  // password visibility will be toggled by holding the button
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
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="surface-card w-full max-w-4xl overflow-hidden md:grid md:grid-cols-[1.1fr_1fr]">
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-brand-500 to-brand-700 p-10 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              AI Personalized Study Planner
            </p>
            <h2 className="mt-4 text-3xl font-bold">Welcome back</h2>
            <p className="mt-3 text-sm text-white/80">
              Stay consistent with your plan. Pick up right where you left off.
            </p>
          </div>
          <div className="space-y-3 text-sm text-white/80">
            <div className="rounded-2xl bg-white/15 p-4">
              Track today’s tasks and complete them with real evidence.
            </div>
            <div className="rounded-2xl bg-white/15 p-4">
              Keep your streak alive with daily progress.
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <form onSubmit={handleSubmit}>
            <p className="section-title">Welcome Back</p>
            <h1 className="text-2xl font-bold text-brand-700">Sign in to your planner</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to continue your study plan.</p>

            <div className="mt-4 space-y-3">
              <input
                className="field-input"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
              <div className="relative">
                <input
                  className="field-input pr-10"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-xl"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  onTouchStart={() => setShowPassword(true)}
                  onTouchEnd={() => setShowPassword(false)}
                >
                  {"👁"}
                </button>
              </div>
            </div>

            {error ? <p className="status-error mt-3">{error}</p> : null}

            <button type="submit" disabled={submitting} className="btn-primary mt-5">
              {submitting ? "Signing in..." : "Login"}
            </button>

            <p className="mt-4 text-center text-sm text-slate-500">
              New user?{" "}
              <Link to="/register" className="font-semibold text-brand-700">
                Create account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
