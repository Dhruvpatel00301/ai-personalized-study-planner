import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // visibility toggles will respond to hold events
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (form.password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      await register(form);
      // after registration go to login page so the user can sign in
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
            <h2 className="mt-4 text-3xl font-bold">Create your account</h2>
            <p className="mt-3 text-sm text-white/80">
              Build a plan that fits your exam goals and weekly rhythm.
            </p>
          </div>
          <div className="space-y-3 text-sm text-white/80">
            <div className="rounded-2xl bg-white/15 p-4">
              Generate smart schedules based on your strengths.
            </div>
            <div className="rounded-2xl bg-white/15 p-4">
              Track progress with evidence and streaks.
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <form onSubmit={handleSubmit}>
            <p className="section-title">Get Started</p>
            <h1 className="text-2xl font-bold text-brand-700">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500">Build your personalized study schedule.</p>

            <div className="mt-4 space-y-3">
              <input
                className="field-input"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
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
              <div className="relative">
                <input
                  className="field-input pr-10"
                  placeholder="Confirm password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-xl"
                  onMouseDown={() => setShowConfirm(true)}
                  onMouseUp={() => setShowConfirm(false)}
                  onMouseLeave={() => setShowConfirm(false)}
                  onTouchStart={() => setShowConfirm(true)}
                  onTouchEnd={() => setShowConfirm(false)}
                >
                  {"👁"}
                </button>
              </div>
            </div>

            {error ? <p className="status-error mt-3">{error}</p> : null}

            <button type="submit" disabled={submitting} className="btn-primary mt-5">
              {submitting ? "Creating..." : "Register"}
            </button>

            <p className="mt-4 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-brand-700">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
