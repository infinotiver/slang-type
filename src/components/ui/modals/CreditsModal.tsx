import ModalBase from "./ModalBase";
import {
  Atom,
  FileCode2,
  Wind,
  Zap,
  LineChart,
  Shapes,
  Users,
  BarChart3,
  Timer,
  Sparkles,
} from "lucide-react";
import { fetchOverviewStats, type OverviewStats } from "@/api/stats";
import { useEffect, useState } from "react";
import { formatDuration } from "@/utils/timeFormat";

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const technologies = [
  { label: "React", Icon: Atom },
  { label: "TypeScript", Icon: FileCode2 },
  { label: "Tailwind CSS", Icon: Wind },
  { label: "Vite", Icon: Zap },
  { label: "Lucide Icons", Icon: Shapes },
  { label: "Recharts", Icon: LineChart },
];

export default function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    queueMicrotask(async () => {
      if (!active) return;
      setStatus("loading");

      try {
        const data = await fetchOverviewStats();
        if (!active) return;
        setStats(data);
        setStatus("ready");
      } catch {
        if (!active) return;
        setStats(null);
        setStatus("error");
      }
    });

    return () => {
      active = false;
    };
  }, [isOpen]);
  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="credits">
      <div className="space-y-5">
        <div>
          <p className="text-xs text-foreground/60 font-mono">made by</p>
          <a
            href="https://github.com/infinotiver"
            className="mt-1 inline-flex items-center gap-2 text-highlight font-bold font-mono text-sm hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            infinotiver
          </a>
        </div>

        <div>
          <h3 className="text-highlight font-bold mb-2 font-mono text-xs">
            built with
          </h3>
          <ul className="flex flex-wrap justify-start gap-2">
            {technologies.map(({ label, Icon }) => (
              <li
                key={label}
                className="flex items-center gap-1.5 bg-secondary/10 border border-secondary/25 rounded px-2.5 py-1 text-xs font-mono text-foreground/70"
              >
                <Icon size={12} className="text-highlight/80" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <h3 className="text-highlight font-bold my-2 font-mono text-xs">
          platform stats
        </h3>

        {status === "loading" ? (
          <p className="text-xs text-foreground/60 font-mono">loading...</p>
        ) : status === "ready" && stats ? (
          <ul className="grid grid-cols-2 gap-2">
            <li className="flex items-center gap-1.5 bg-secondary/10 border border-secondary/25 rounded px-2.5 py-1 text-xs font-mono text-foreground/70">
              <Users size={12} className="text-highlight/80" />
              users: {stats.totalUsers}
            </li>
            <li className="flex items-center gap-1.5 bg-secondary/10 border border-secondary/25 rounded px-2.5 py-1 text-xs font-mono text-foreground/70">
              <BarChart3 size={12} className="text-highlight/80" />
              tests: {stats.totalTests}
            </li>
            <li className="flex items-center gap-1.5 bg-secondary/10 border border-secondary/25 rounded px-2.5 py-1 text-xs font-mono text-foreground/70">
              <Timer size={12} className="text-highlight/80" />
              typed:{" "}
              {formatDuration(stats.totalTypedSeconds, { showSeconds: false })}
            </li>
            <li className="flex items-center gap-1.5 bg-secondary/10 border border-secondary/25 rounded px-2.5 py-1 text-xs font-mono text-foreground/70">
              <Sparkles size={12} className="text-highlight/80" />
              ai gens: {stats.totalAiGenerations}
            </li>
          </ul>
        ) : (
          <p className="text-xs text-foreground/60 font-mono">
            stats unavailable
          </p>
        )}
      </div>
    </ModalBase>
  );
}
