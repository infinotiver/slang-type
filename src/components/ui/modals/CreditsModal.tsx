
import ModalBase from "./ModalBase";
import {
  Atom,
  FileCode2,
  Wind,
  Zap,
  LineChart,
  Shapes,
  Github,
} from "lucide-react";

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
            <Github size={14} className="text-highlight/80" />
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
    </ModalBase>
  );
}
