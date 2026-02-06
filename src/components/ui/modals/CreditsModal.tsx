import {
  Code,
  Palette,
  BarChart,
  Settings,
  Newspaper,
  Info,
} from "lucide-react";
import ModalBase from "./ModalBase";

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
  const technologies = [
    { name: "React", description: "UI library", icon: Code },
    { name: "TypeScript", description: "type safety", icon: Code },
    { name: "Tailwind CSS", description: "styling", icon: Palette },
    { name: "Vite", description: "build tool", icon: Settings },
    { name: "Lucide Icons", description: "icon set", icon: Palette },
    { name: "Recharts", description: "data visualization", icon: BarChart },
  ];

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="credits">
      <div className="space-y-3">
        <div className="pb-2 border-b border-secondary/40">
          <div className="flex items-center gap-1">
            <p className="text-foreground text-sm font-mono font-bold">
              made by{" "}
              <a
                href="https://github.com/infinotiver"
                className="text-highlight hover:underline transition-colors"
              >
                infinotiver
              </a>
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-highlight font-bold mb-2 font-mono text-xs">
            built with
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {technologies.map((tech) => {
              const Icon = tech.icon;
              return (
                <div
                  key={tech.name}
                  className="flex items-center gap-2 p-2 rounded border border-secondary/30 hover:border-highlight/50 transition-all"
                >
                  <Icon size={18} className="text-highlight shrink-0" />
                  <div className="font-mono text-xs">
                    <p className="text-foreground">{tech.name}</p>
                    <p className="text-foreground/60 text-xs">
                      {tech.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ModalBase>
  );
}
