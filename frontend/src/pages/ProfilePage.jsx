import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import profileService from "../services/profileService";

function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  const initials = useMemo(() => {
    const name = user?.name || "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

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

  return (
    <div className="surface-card p-5">
      <div className="flex flex-col items-center">
        <label htmlFor="profile-image-upload" className={uploading ? "cursor-not-allowed" : "cursor-pointer"}>
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
        </label>

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
  );
}

export default ProfilePage;
