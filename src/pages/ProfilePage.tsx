import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TbArrowLeft } from "react-icons/tb";
import { useHistoryStats } from "@hooks/useHistoryStats";
import { HistoryStatCard, StatBreakdownCard } from "@components/ui/stats";
import { ChartContainer } from "@components/ui/charts";
import { AttemptListItem } from "@components/ui/lists";
import { Button } from "@components/ui/common";
import { useAuth } from "@/hooks/useAuth";
import { useSyncAttempts } from "@/hooks/useSyncAttempts";
import { fetchHistory } from "@/api/results";
import {
  calculateAllStats,
  calculateWpmProgressionData,
} from "@utils/historyStats";
import type { TypingAttempt } from "@shared-types/index";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { status: syncStatus } = useSyncAttempts();

  // Local attempts (saved locally until successful sync)
  const { allAttempts: localAttempts } = useHistoryStats();

  // Server attempts: null = not yet fetched, [] = empty
  const [serverAttempts, setServerAttempts] = useState<TypingAttempt[] | null>(
    null,
  );

  // True while waiting for the server response
  const loadingServer =
    Boolean(user) && syncStatus === "done" && serverAttempts === null;

  useEffect(() => {
    if (!user || syncStatus !== "done" || serverAttempts !== null) return;
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

  // Use server data when available, otherwise local
  const sourceAttempts =
    user && serverAttempts !== null ? serverAttempts : localAttempts;

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

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatTime = (s: number) => {
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const r = s % 60;
    return r === 0 ? `${m}m` : `${m}m ${r}s`;
  };

  const getLanguageLabel = (lang: string) =>
    ({ slang: "slang", english: "english", code: "code" })[lang] ?? lang;

  // ── Detail view ───────────────────────────────────────────────────────────
  if (selectedAttempt) {
    const mins = selectedAttempt.elapsed / 60;
    const rawWpm =
      selectedAttempt.totalTyped > 0
        ? Math.round(selectedAttempt.totalTyped / 5 / mins)
        : 0;
    const adjWpm = Math.round(
      (Math.round(selectedAttempt.accuracy) / 100) * rawWpm,
    );

    return (
      <div className="bg-background text-foreground flex flex-col font-mono">
        <header className="py-4 sm:py-5 border-b border-secondary/40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedAttemptId(null)}
              className="p-2 text-foreground/60 hover:text-highlight transition-colors active:scale-95 -ml-2"
              aria-label="back"
            >
              <TbArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-wider">
                attempt details
              </h1>
              <p className="text-xs text-foreground/60 mt-1">
                {formatDate(selectedAttempt.timestamp)}
              </p>
            </div>
          </div>
        </header>
        <main className="flex-1 py-4 sm:py-6">
          <div className="mb-6 pb-6 border-b border-secondary/35">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-foreground/70 tracking-wider font-light">
                  test type
                </div>
                <div className="text-sm font-mono">
                  {getLanguageLabel(selectedAttempt.language)} /{" "}
                  {selectedAttempt.mode}
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/70 tracking-wider font-light">
                  duration
                </div>
                <div className="text-sm font-mono">
                  {selectedAttempt.elapsed}s
                </div>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-sm font-mono text-foreground/70 mb-4 tracking-wider">
              performance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "adjusted wpm", value: adjWpm, highlight: true },
                { label: "raw wpm", value: rawWpm },
                {
                  label: "accuracy",
                  value: `${Math.round(selectedAttempt.accuracy)}%`,
                },
                { label: "time elapsed", value: `${selectedAttempt.elapsed}s` },
              ].map(({ label, value, highlight }) => (
                <div key={label}>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    {label}
                  </div>
                  <div
                    className={`text-2xl font-bold ${highlight ? "text-highlight" : "text-foreground"}`}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-sm font-mono text-foreground/70 mb-4 tracking-wider">
              character stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "total typed", value: selectedAttempt.totalTyped },
                {
                  label: "correct",
                  value: selectedAttempt.correctChars,
                  cls: "text-highlight",
                },
                {
                  label: "errors",
                  value: selectedAttempt.errors,
                  cls: "text-red-500",
                },
                {
                  label: "error rate",
                  value:
                    selectedAttempt.totalTyped > 0
                      ? `${(((selectedAttempt.totalTyped - selectedAttempt.correctChars) / selectedAttempt.totalTyped) * 100).toFixed(1)}%`
                      : "0.0%",
                },
              ].map(({ label, value, cls }) => (
                <div key={label}>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    {label}
                  </div>
                  <div className={`text-lg font-semibold ${cls ?? ""}`}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <Button onClick={() => navigate("/")}>try again</Button>
          </div>
        </main>
      </div>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-background text-foreground flex flex-col font-mono">
      {/* Page header */}
      <header className="py-2 sm:py-3 border-b border-secondary/40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 text-foreground/60 hover:text-highlight transition-colors active:scale-95 -ml-2"
            aria-label="back"
          >
            <TbArrowLeft size={24} />
          </button>
          <h1 className="text-lg sm:text-xl font-bold tracking-wider">
            {user ? (user.username ?? user.email) : "history"}
          </h1>
        </div>
      </header>

      <main className="flex-1 py-4 sm:py-6 space-y-6">
        {/* ── Profile section (logged-in users only) ── */}
        {user ? (
          <div className="flex items-center justify-between border border-secondary/30 rounded-lg px-4 py-3 bg-secondary/5">
            <div className="text-sm font-mono space-y-0.5">
              {user.username ? (
                <div className="text-foreground/80">{user.username}</div>
              ) : null}
              <div className="text-foreground/50 text-xs">{user.email}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 border border-secondary rounded hover:border-highlight/50 hover:text-highlight transition-colors text-foreground/60"
            >
              log out
            </button>
          </div>
        ) : (
          /* ── Guest banner ── */
          <div className="border border-secondary/30 rounded-lg px-4 py-3 bg-secondary/5 flex items-center justify-between gap-4">
            <p className="text-xs text-foreground/60">
              your attempts are saved locally — sign in to sync them to your
              account
            </p>
            <div className="flex gap-2 shrink-0">
              <Link
                to="/login"
                className="text-xs px-3 py-1.5 border border-secondary rounded hover:border-highlight/50 hover:text-highlight transition-colors text-foreground/60"
              >
                login
              </Link>
              <Link
                to="/signup"
                className="text-xs px-3 py-1.5 border border-highlight/60 rounded hover:bg-highlight/10 text-highlight transition-colors"
              >
                sign up
              </Link>
            </div>
          </div>
        )}

        {/* ── Sync status ── */}
        {user && syncStatus === "syncing" ? (
          <p className="text-xs text-foreground/50 font-mono">
            syncing local data to your account…
          </p>
        ) : null}

        {user && syncStatus === "error" ? (
          <p className="text-xs text-red-400 font-mono">
            sync failed — local data is safely retained. retry by refreshing.
          </p>
        ) : null}

        {/* ── History content ── */}
        {loadingServer ? (
          <div className="flex items-center justify-center min-h-40">
            <p className="text-sm text-foreground/50">loading history…</p>
          </div>
        ) : allAttempts.length > 0 ? (
          <>
            {/* Key stats */}
            <div className="p-3 border border-secondary/35 rounded-xl bg-secondary/8">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <HistoryStatCard
                  label="best wpm"
                  value={stats.bestWpm}
                  highlight
                />
                <HistoryStatCard label="avg wpm" value={stats.avgWpm} />
                <HistoryStatCard
                  label="best acc"
                  value={`${Math.round(stats.bestAccuracy)}%`}
                />
                <HistoryStatCard
                  label="total time"
                  value={formatTime(stats.totalTime)}
                />
                <HistoryStatCard label="attempts" value={stats.totalAttempts} />
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                title="wpm progression"
                data={wpmProgressionData}
                dataKey="wpm"
                stroke="#10b981"
              />
              <ChartContainer
                title="accuracy trend"
                data={wpmProgressionData}
                dataKey="accuracy"
                stroke="#f59e0b"
                yAxisDomain={[0, 100]}
              />
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xs font-mono text-foreground/70 mb-2 tracking-wider uppercase">
                  by language
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(statsByLanguage).map(([lang, attempt]) => (
                    <StatBreakdownCard
                      key={lang}
                      label={getLanguageLabel(lang)}
                      attempt={attempt}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-xs font-mono text-foreground/70 mb-2 tracking-wider uppercase">
                  by mode
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(statsByMode)
                    .sort(
                      ([a], [b]) =>
                        ((
                          ({
                            "15s": 0,
                            "30s": 1,
                            "60s": 2,
                            "120s": 3,
                          }) as Record<string, number>
                        )[a] ?? 99) -
                        ((
                          { "15s": 0, "30s": 1, "60s": 2, "120s": 3 } as Record<
                            string,
                            number
                          >
                        )[b] ?? 99),
                    )
                    .map(([mode, attempt]) => (
                      <StatBreakdownCard
                        key={mode}
                        label={mode}
                        attempt={attempt}
                      />
                    ))}
                </div>
              </div>
            </div>

            {/* Attempts list */}
            <div>
              <h2 className="text-xs font-mono text-foreground/70 mb-2 tracking-wider uppercase">
                attempts ({allAttempts.length})
              </h2>
              <div className="space-y-0.5">
                {allAttempts.map((attempt) => (
                  <AttemptListItem
                    key={attempt.id}
                    attempt={attempt}
                    formatDate={formatDate}
                    getLanguageLabel={getLanguageLabel}
                    onSelect={(a) => setSelectedAttemptId(a.id)}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center min-h-60">
            <p className="text-sm text-foreground/70 text-center">
              no attempts yet — start typing to build your history!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
