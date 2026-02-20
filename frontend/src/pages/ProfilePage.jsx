import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import profileService from "../services/profileService";

function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    timezone: user?.timezone || "America/New_York",
    reminderHour: user?.reminderHour ?? 19,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdate = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const data = await profileService.updateProfile({
        ...form,
        reminderHour: Number(form.reminderHour),
      });
      setUser(data);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleUpdate} className="rounded-card bg-white p-4 shadow-soft">
        <p className="mb-3 text-sm font-semibold text-slate-700">Profile Settings</p>

        <div className="space-y-2">
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Name"
          />
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.timezone}
            onChange={(e) => setForm((prev) => ({ ...prev, timezone: e.target.value }))}
            placeholder="Timezone"
          />
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            type="number"
            min="0"
            max="23"
            value={form.reminderHour}
            onChange={(e) => setForm((prev) => ({ ...prev, reminderHour: e.target.value }))}
            placeholder="Reminder hour"
          />
        </div>

        {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        <button type="submit" className="mt-3 w-full rounded-lg bg-brand-500 py-2 text-sm font-semibold text-white">
          Save Changes
        </button>
      </form>

      <button
        type="button"
        onClick={logout}
        className="w-full rounded-lg bg-slate-700 py-2 text-sm font-semibold text-white"
      >
        Logout
      </button>
    </div>
  );
}

export default ProfilePage;
