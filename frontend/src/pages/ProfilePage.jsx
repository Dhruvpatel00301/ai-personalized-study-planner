import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import profileService from "../services/profileService";

const clampPercent = (value) => Math.max(0, Math.min(100, value));

const ProgressRing = ({ label, value, target, unit }) => {
  const radius = 38;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percent = target > 0 ? clampPercent(Math.round((value / target) * 100)) : 0;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <svg height={radius * 2} width={radius * 2} className="text-brand-500">
        <circle
          stroke="#E2ECF9"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="12"
          fill="#1d4ed8"
          fontWeight="600"
        >
          {percent}%
        </text>
      </svg>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-lg font-semibold text-slate-800">
          {value}/{target} {unit}
        </p>
      </div>
    </div>
  );
};

function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState(user?.dailyTargetMinutes || 60);
  const [weeklyTargetHours, setWeeklyTargetHours] = useState(user?.weeklyTargetHours || 6);
  const [goalStats, setGoalStats] = useState(null);
  const [goalLoading, setGoalLoading] = useState(false);
  const [showTodayDetails, setShowTodayDetails] = useState(false);

  const initials = useMemo(() => {
    const name = user?.name || "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

  useEffect(() => {
    const loadGoals = async () => {
      setGoalLoading(true);
      try {
        const data = await profileService.getGoalProgress();
        setGoalStats(data);
      } catch {
        // ignore
      } finally {
        setGoalLoading(false);
      }
    };

    loadGoals();
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const data = await profileService.uploadProfileImage(file);
      setUser((prev) => ({ ...prev, ...data }));
    } catch {
      // Keep the profile surface minimal and avoid extra status elements.
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleGoalSave = async () => {
    setSaving(true);
    try {
      const updated = await profileService.updateProfile({
        dailyTargetMinutes,
        weeklyTargetHours,
      });
      setUser((prev) => ({ ...prev, ...updated }));
      const refreshed = await profileService.getGoalProgress();
      setGoalStats(refreshed);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const formatMinutes = (minutes) => {
    const total = Math.max(0, Number(minutes) || 0);
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-4">
      <div className="surface-card p-5">
        <div className="flex flex-col items-center">
          <div className="relative">
            <label
              htmlFor="profile-image-upload"
              className={
                uploading
                  ? "cursor-not-allowed"
                  : "cursor-pointer flex items-center justify-center"
              }
            >
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="h-24 w-24 rounded-full border border-white object-cover shadow-soft"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
                  {initials}
                </div>
              )}
              {!uploading && (
                <span className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-white text-xs flex items-center justify-center shadow-sm">
                  ?
                </span>
              )}
            </label>
          </div>

          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />

          {editing ? (
            <div className="space-y-3 mt-4 w-full">
              <input
                className="field-input w-full"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Full name"
              />
              <input
                className="field-input w-full"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Email"
                type="email"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={saving}
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={saving}
                  onClick={async () => {
                    setSaving(true);
                    try {
                      const updated = await profileService.updateProfile({
                        name: editName,
                        email: editEmail,
                      });
                      setUser((prev) => ({ ...prev, ...updated }));
                      setEditing(false);
                    } catch (err) {
                      // could show a toast or error state here
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-4 text-lg font-semibold text-slate-800">{user?.name || "-"}</p>
              <p className="text-sm text-slate-500">{user?.email || "-"}</p>
              <button
                type="button"
                className="btn-secondary mt-4"
                onClick={() => {
                  setEditName(user?.name || "");
                  setEditEmail(user?.email || "");
                  setEditing(true);
                }}
              >
                Edit profile
              </button>
            </>
          )}

          <button type="button" onClick={logout} className="btn-secondary mt-4">
            Logout
          </button>
        </div>
      </div>

      <div className="surface-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-title">Personal Study Goals</p>
            <p className="text-sm text-slate-600">Set daily and weekly targets to stay consistent.</p>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-brand-600"
            onClick={handleGoalSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Goals"}
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Daily target (minutes)
            <input
              type="number"
              min="5"
              max="600"
              className="field-input mt-2"
              value={dailyTargetMinutes}
              onChange={(event) => setDailyTargetMinutes(Number(event.target.value))}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Weekly target (hours)
            <input
              type="number"
              min="1"
              max="80"
              className="field-input mt-2"
              value={weeklyTargetHours}
              onChange={(event) => setWeeklyTargetHours(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="surface-card p-4">
            <button
              type="button"
              className="w-full text-left"
              onClick={() => setShowTodayDetails((prev) => !prev)}
            >
              <ProgressRing
                label="Today"
                value={goalStats?.dailyMinutes || 0}
                target={goalStats?.dailyTargetMinutes || dailyTargetMinutes || 0}
                unit="min"
              />
            </button>
            {showTodayDetails ? (
              <div className="mt-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Today's topic breakdown</p>
                {goalStats?.todayTopicBreakdown?.length ? (
                  <ul className="mt-2 space-y-1">
                    {goalStats.todayTopicBreakdown.map((entry) => (
                      <li key={`${entry.topicTitle}-${entry.subjectName}`} className="text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-800">{entry.topicTitle}</p>
                            <p className="text-xs text-slate-500">{entry.subjectName}</p>
                          </div>
                          <span className="font-semibold text-slate-800">{formatMinutes(entry.minutes)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No study time logged today yet.</p>
                )}
              </div>
            ) : null}
          </div>
          <div className="surface-card p-4">
            <ProgressRing
              label="This week"
              value={goalStats?.weeklyMinutes || 0}
              target={(goalStats?.weeklyTargetHours || weeklyTargetHours || 0) * 60}
              unit="min"
            />
          </div>
        </div>

        {goalLoading ? (
          <p className="mt-3 text-xs text-slate-500">Refreshing progress...</p>
        ) : null}
      </div>
    </div>
  );
}

export default ProfilePage;