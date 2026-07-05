import ModalBase from "./ModalBase";
import { Heart } from "lucide-react";
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
                className="inline-flex items-center gap-2 rounded-lg border border-secondary/20 bg-background/40 px-3 py-1.5 text-xs"
              >
                <Icon size={16} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-center gap-1 border-t border-secondary/30 pt-4 text-xs text-foreground/50">
          made with{" "}
          <Heart size={12} className="text-pink-600 fill-pink-600" />
        </div>
      </div>
    </ModalBase>
  );
}
