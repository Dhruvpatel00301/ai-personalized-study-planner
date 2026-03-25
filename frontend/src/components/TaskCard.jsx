import { useEffect, useRef, useState } from "react";

function TaskCard({ task, disabled, hideStrengthLabel, onComplete, onSave, onUploadProof }) {
  const strengthColors = {
    weak: {
      border: "border-l-4 border-l-red-600",
      badge: "bg-red-100 text-red-800",
    },
    normal: {
      border: "border-l-4 border-l-yellow-500",
      badge: "bg-yellow-100 text-yellow-800",
    },
    strong: {
      border: "border-l-4 border-l-green-600",
      badge: "bg-green-100 text-green-800",
    },
  };

  const colors = strengthColors[task.strength] || strengthColors.normal;
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startAt, setStartAt] = useState(null);
  const [proofUrl, setProofUrl] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savedElapsed, setSavedElapsed] = useState(0);
  const [savedProofUrl, setSavedProofUrl] = useState("");
  const [hasAutoCompleted, setHasAutoCompleted] = useState(false);
  const [savedSessionId, setSavedSessionId] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const storageKey = `taskTimer:${task.taskId}`;
  const activeKey = "activeTaskTimer";
  const STALE_ACTIVE_MS = 15000;

  const claimActiveSlot = () => {
    try {
      const active = localStorage.getItem(activeKey);
      if (active && active !== String(task.taskId)) {
        const activeStateRaw = localStorage.getItem(`taskTimer:${active}`);
        if (activeStateRaw) {
          try {
            const activeState = JSON.parse(activeStateRaw);
            const lastUpdated = typeof activeState?.updatedAt === "number" ? activeState.updatedAt : 0;
            const isStale = lastUpdated && Date.now() - lastUpdated > STALE_ACTIVE_MS;
            if (activeState?.isRunning || isStale) {
              localStorage.setItem(
                `taskTimer:${active}`,
                JSON.stringify({
                  ...activeState,
                  isRunning: false,
                  updatedAt: Date.now(),
                })
              );
            }
          } catch {
            // ignore parse errors
          }
        }
        localStorage.removeItem(activeKey);
      }
      localStorage.setItem(activeKey, String(task.taskId));
      return true;
    } catch {
      return true;
    }
  };

  const canClaimActiveSlot = () => {
    try {
      const active = localStorage.getItem(activeKey);
      if (!active || active === String(task.taskId)) {
        return true;
      }
      const activeStateRaw = localStorage.getItem(`taskTimer:${active}`);
      if (!activeStateRaw) {
        localStorage.removeItem(activeKey);
        return true;
      }
      const activeState = JSON.parse(activeStateRaw);
      const lastUpdated = typeof activeState?.updatedAt === "number" ? activeState.updatedAt : 0;
      if (!lastUpdated || Date.now() - lastUpdated > STALE_ACTIVE_MS) {
        localStorage.removeItem(activeKey);
        return true;
      }
      if (!activeState?.isRunning) {
        localStorage.removeItem(activeKey);
        return true;
      }
      return false;
    } catch {
      return true;
    }
  };

  const persistState = (next) => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ ...next, updatedAt: Date.now() })
      );
    } catch {
      // ignore storage write errors
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        const lastUpdated = typeof data.updatedAt === "number" ? data.updatedAt : 0;
        if (data.isRunning && lastUpdated && Date.now() - lastUpdated > STALE_ACTIVE_MS) {
          setIsRunning(false);
          persistState({
            isRunning: false,
            startAt: data.startAt || null,
            elapsedSeconds: data.elapsedSeconds || 0,
            isSaved: data.isSaved || false,
            savedElapsed: data.savedElapsed || 0,
            savedSessionId: data.savedSessionId || "",
          });
        }
        if (typeof data.elapsedSeconds === "number") {
          setElapsedSeconds(data.elapsedSeconds);
        }
        if (typeof data.startAt === "number") {
          setStartAt(data.startAt);
        }
        if (typeof data.isRunning === "boolean") {
          setIsRunning(data.isRunning);
        }
        if (typeof data.isSaved === "boolean") {
          const hasSession = typeof data.savedSessionId === "string" && data.savedSessionId.length > 0;
          if (data.isSaved && !hasSession) {
            setIsSaved(false);
            setSavedSessionId("");
            setUploadError("Session not saved. Tap Save and try again.");
            persistState({
              isRunning: false,
              startAt: typeof data.startAt === "number" ? data.startAt : null,
              elapsedSeconds: typeof data.elapsedSeconds === "number" ? data.elapsedSeconds : 0,
              isSaved: false,
              savedElapsed: typeof data.savedElapsed === "number" ? data.savedElapsed : 0,
              savedSessionId: "",
            });
          } else {
            setIsSaved(data.isSaved);
          }
        }
        if (typeof data.savedElapsed === "number") {
          setSavedElapsed(data.savedElapsed);
        }
        if (typeof data.savedSessionId === "string") {
          setSavedSessionId(data.savedSessionId);
        }
        if (data.isRunning && typeof data.startAt === "number") {
          const seconds = Math.max(0, Math.floor((Date.now() - data.startAt) / 1000));
          setElapsedSeconds(seconds);
        }
      }
    } catch {
      // ignore storage parse errors
    } finally {
      // no-op
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isRunning || !startAt) return undefined;

    const interval = setInterval(() => {
      try {
        const active = localStorage.getItem(activeKey);
        if (active && active !== String(task.taskId)) {
          setIsRunning(false);
          persistState({
            isRunning: false,
            startAt,
            elapsedSeconds,
            isSaved,
            savedElapsed,
            savedSessionId,
          });
          return;
        }
      } catch {
        // ignore storage errors
      }

      const seconds = Math.max(0, Math.floor((Date.now() - startAt) / 1000));
      setElapsedSeconds(seconds);
      persistState({
        isRunning: true,
        startAt,
        elapsedSeconds: seconds,
        isSaved,
        savedElapsed,
        savedSessionId,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startAt, isSaved, savedElapsed, task.taskId]);


  // persist during active ticking to survive unmounts

  useEffect(() => {
    return () => {
      if (proofUrl) {
        URL.revokeObjectURL(proofUrl);
      }
      if (savedProofUrl) {
        URL.revokeObjectURL(savedProofUrl);
      }
    };
  }, [proofUrl, savedProofUrl]);

  const formatElapsed = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      persistState({
        isRunning: false,
        startAt,
        elapsedSeconds,
        isSaved,
        savedElapsed,
        savedSessionId,
      });
      try {
        const active = localStorage.getItem(activeKey);
        if (active === String(task.taskId)) {
          localStorage.removeItem(activeKey);
        }
      } catch {
        // ignore storage errors
      }
      return;
    }
    if (isSaved) {
      return;
    }
    try {
      if (!canClaimActiveSlot()) {
        claimActiveSlot();
      } else {
        localStorage.setItem(activeKey, String(task.taskId));
      }
    } catch {
      // ignore storage errors
    }
    const nextStart = Date.now() - (isSaved ? 0 : elapsedSeconds) * 1000;
    setStartAt(nextStart);
    setIsRunning(true);
    persistState({
      isRunning: true,
      startAt: nextStart,
      elapsedSeconds,
      isSaved: false,
      savedElapsed: 0,
      savedSessionId: "",
    });
  };

  const handleAddScreenshot = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError("");
    if (proofUrl) {
      URL.revokeObjectURL(proofUrl);
    }
    const nextUrl = URL.createObjectURL(file);
    setProofUrl(nextUrl);
    setProofFile(file);
    if (isSaved) {
      if (savedProofUrl) {
        URL.revokeObjectURL(savedProofUrl);
      }
      setSavedProofUrl(nextUrl);
      if (!savedSessionId) {
        setUploadError("Session not saved. Tap Save and try again.");
        return;
      }
      if (savedSessionId && onUploadProof) {
        try {
          const result = await onUploadProof({ sessionId: savedSessionId, proofFile: file });
          if (result?.ok === false) {
            setUploadError(result.message || "Upload failed");
            return;
          }
          if (onComplete && !task.completed && !hasAutoCompleted) {
            setHasAutoCompleted(true);
            onComplete(task.taskId);
          }
        } catch (err) {
          setUploadError(err?.response?.data?.message || "Upload failed");
        }
      }
    }
  };

  const handleSave = async () => {
    if (isRunning) {
      setIsRunning(false);
    }
    setUploadError("");
    if (onSave) {
      try {
        const result = await onSave({
          topicId: task.topicId,
          durationSeconds: Math.max(1, elapsedSeconds),
          startedAt: startAt ? new Date(startAt).toISOString() : null,
          proofFile,
        });
        if (!result?.id || result?.ok === false) {
          setIsSaved(false);
          setSavedSessionId("");
          setUploadError(result?.message || "Save failed. Please try again.");
          return;
        }
        setSavedElapsed(elapsedSeconds);
        setSavedProofUrl(proofUrl || "");
        setIsSaved(true);
        setSavedSessionId(result.id);
        persistState({
          isRunning: false,
          startAt,
          elapsedSeconds,
          isSaved: true,
          savedElapsed: elapsedSeconds,
          savedSessionId: result.id,
        });
        // do not auto-complete on save; completion happens after screenshot upload
      } catch {
        setIsSaved(false);
        setSavedSessionId("");
        setUploadError("Save failed. Please try again.");
        return;
      }
    } else {
      setIsSaved(false);
      setUploadError("Save failed. Please try again.");
      return;
    }
    try {
      const active = localStorage.getItem(activeKey);
      if (active === String(task.taskId)) {
        localStorage.removeItem(activeKey);
      }
    } catch {
      // ignore storage errors
    }
  };

  return (
    <div className={`surface-card p-4 ${colors.border}`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {task.examName ? (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
              {task.examName}
            </p>
          ) : null}
          <p className="text-sm font-semibold text-slate-800">{task.topicTitle}</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <p className="text-xs text-slate-600 font-medium">{task.subjectName}</p>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
              {task.taskType}
            </span>
            {!hideStrengthLabel && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colors.badge}`}
              >
                {task.strength}
              </span>
            )}
          </div>
        </div>

        </div>

        {disabled ? null : (
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={disabled || isSaved}
              onClick={toggleTimer}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                isRunning ? "bg-emerald-100 text-emerald-700" : "bg-brand-500 text-white"
              }`}
            >
              {isRunning ? "Stop Timer" : "Start Timer"}
            </button>
            <button
              type="button"
              disabled={disabled || isSaved}
              onClick={handleSave}
              className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaved ? "Saved" : "Save"}
            </button>
            <button
              type="button"
              disabled={disabled || !isSaved}
              onClick={handleAddScreenshot}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Screenshot
            </button>
          </div>
        )}

        <span className="text-xs font-semibold text-slate-600">
          {formatElapsed(isSaved ? savedElapsed : elapsedSeconds)}
        </span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {(isSaved ? savedProofUrl : proofUrl) ? (
        <div className="mt-3">
          <img
            src={isSaved ? savedProofUrl : proofUrl}
            alt="Session proof"
            className="h-20 w-20 rounded-lg object-cover border border-slate-200"
          />
        </div>
      ) : null}
      {uploadError ? <p className="mt-2 text-xs font-semibold text-red-600">{uploadError}</p> : null}
    </div>
  );
}

export default TaskCard;
