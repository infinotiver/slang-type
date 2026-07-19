import { useGlobalUsage } from "@/hooks/useGlobalStats";
import ModalBase from "./ModalBase";
import {
  SiGithub,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiVite,
  SiLucide,
} from "react-icons/si";

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const technologies = [
  { label: "React", Icon: SiReact },
  { label: "TypeScript", Icon: SiTypescript },
  { label: "Tailwind CSS", Icon: SiTailwindcss },
  { label: "Vite", Icon: SiVite },
  { label: "Lucide", Icon: SiLucide },
];

export default function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
  // gated on isOpen: fetches fresh the moment the modal opens, and stops
  // polling entirely while it's closed instead of running for the whole session
  const { usage } = useGlobalUsage({ enabled: isOpen });

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="credits">
      <div className="space-y-4 font-mono">
        <section>
          <a
            href="https://github.com/infinotiver"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-semibold py-1 px-2 rounded-full bg-highlight text-background transition-opacity hover:opacity-80"
          >
            <SiGithub size={16} />
            infinotiver
          </a>
        </section>

        <section>
          <p className="mb-3 text-xs tracking-wider text-foreground/50">
            built with
          </p>

          <div className="flex flex-wrap gap-2">
            {technologies.map(({ label, Icon }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 rounded-lg border border-secondary/40 bg-background/40 px-4 py-2 text-xs"
              >
                <Icon size={16} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-center gap-1 border-t border-secondary/30 pt-4 text-xs text-foreground/50">
          {usage && (
            <p className="text-xs text-foreground/50">
              {usage.testsCount.toLocaleString()} tests ·{" "}
              {Math.round(usage.totalTypedSeconds / 3600)}h typed globally
            </p>
          )}
        </div>
      </div>
    </ModalBase>
  );
}
