import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center px-4">
      <form onSubmit={handleSubmit} className="surface-card w-full p-6">
        <p className="section-title">Get Started</p>
        <h1 className="text-xl font-bold text-brand-700">Create your account</h1>
        <p className="text-sm text-slate-500">Build your personalized study schedule.</p>

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
          {submitting ? "Creating..." : "Register"}
        </button>

        <p className="mt-3 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-semibold text-brand-700">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;

