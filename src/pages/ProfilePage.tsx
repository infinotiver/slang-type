import { useState, useMemo, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSyncAttempts } from "@/hooks/useSyncAttempts";
import { fetchHistory } from "@/api/results";
import {
  calculateAllStats,
  calculateWpmProgressionData,
} from "@utils/historyStats";
import type { TypingAttempt } from "@shared-types/index";
import {
  ProfileAccountCard,
  ProfileAttemptDetail,
  ProfileHistorySection,
  ProfileTopBar,
} from "@/components/profile";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { status: syncStatus } = useSyncAttempts();

  // Server attempts: null = not yet fetched, [] = empty
  const [serverAttempts, setServerAttempts] = useState<TypingAttempt[] | null>(
    null,
  );

  // True while waiting for the server response
  const loadingServer = syncStatus === "done" && serverAttempts === null;

  useEffect(() => {
    if (!user) return;
    if (syncStatus !== "done" || serverAttempts !== null) return;
    let active = true;
    fetchHistory()
      .then(({ attempts }) => {
        if (active) setServerAttempts(attempts);
      })
      .catch(() => {
        if (active) setServerAttempts([]);
      });
    return () => {
      active = false;
    };
  }, [user, syncStatus, serverAttempts]);

  const sourceAttempts = useMemo(() => serverAttempts ?? [], [serverAttempts]);

  const allAttempts = useMemo(
    () => [...sourceAttempts].sort((a, b) => b.timestamp - a.timestamp),
    [sourceAttempts],
  );

  const { stats, statsByLanguage, statsByMode } = useMemo(
    () => calculateAllStats(sourceAttempts),
    [sourceAttempts],
  );

  const wpmProgressionData = useMemo(
    () => calculateWpmProgressionData(sourceAttempts),
    [sourceAttempts],
  );

  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
    null,
  );
  const selectedAttempt = useMemo(
    () =>
      selectedAttemptId
        ? (allAttempts.find((a) => a.id === selectedAttemptId) ?? null)
        : null,
    [selectedAttemptId, allAttempts],
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (selectedAttempt) {
    return (
      <ProfileAttemptDetail
        attempt={selectedAttempt}
        onBack={() => setSelectedAttemptId(null)}
        onTryAgain={() => navigate("/")}
      />
    );
  }

  return (
    <div className="bg-background text-foreground flex flex-col font-mono">
      <ProfileTopBar
        title={user.username ?? user.email}
        onBackHome={() => navigate("/")}
      />

      <main className="flex-1 py-4 sm:py-6 space-y-6">
        <ProfileAccountCard user={user} onLogout={handleLogout} />

        {syncStatus === "syncing" ? (
          <p className="text-xs text-foreground/50 font-mono">
            syncing local data to your account…
          </p>
        ) : null}

        {syncStatus === "error" ? (
          <p className="text-xs text-red-400 font-mono">
            sync failed — local data is safely retained. retry by refreshing.
          </p>
        ) : null}

        {loadingServer ? (
          <div className="flex items-center justify-center min-h-40">
            <p className="text-sm text-foreground/50">loading history…</p>
          </div>
        ) : (
          <ProfileHistorySection
            attempts={allAttempts}
            stats={stats}
            statsByLanguage={statsByLanguage}
            statsByMode={statsByMode}
            wpmProgressionData={wpmProgressionData}
            onSelectAttempt={setSelectedAttemptId}
          />
        )}
      </main>
    </div>
  );
}
