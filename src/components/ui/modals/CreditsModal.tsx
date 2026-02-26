
import { Code, Palette, BarChart, Settings } from "lucide-react";
import ModalBase from "./ModalBase";

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export default function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
  const technologies = [
    { name: "React", description: "UI library", icon: Code, color: "#61dafb" },
    { name: "TypeScript", description: "type safety", icon: Code, color: "#3178c6" },
    { name: "Tailwind CSS", description: "styling", icon: Palette, color: "#38bdf8" },
    { name: "Vite", description: "build tool", icon: Settings, color: "#fbbf24" },
    { name: "Lucide Icons", description: "icon set", icon: Palette, color: "#a3a3a3" },
    { name: "Recharts", description: "data visualization", icon: BarChart, color: "#f472b6" },
  ];

  // Fun stats (example)
  const stats = [
    { label: "lines of code", value: "7,500+" },
    { label: "contributors", value: "1" },
    { label: "open source", value: "yes" },
    { label: "frameworks", value: "6" },
  ];

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="credits">
      <div className="space-y-6">
        {/* Author */}
        <div className="flex flex-col items-center pb-2 border-b border-secondary/40">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-foreground/60 text-xs font-mono">made by</span>
            <a
              href="https://github.com/infinotiver"
              className="text-highlight font-bold font-mono text-sm hover:underline transition-colors"
              target="_blank" rel="noopener noreferrer"
            >
              infinotiver
            </a>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {stats.map((s) => (
              <div key={s.label} className="bg-secondary/10 border border-secondary/30 rounded px-2 py-1 text-xs font-mono text-foreground/70">
                <span className="font-bold text-foreground">{s.value}</span> <span className="ml-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stacked Icons */}
        <div className="flex flex-col items-center">
          <div className="relative h-24 w-24 flex items-center justify-center mb-4">
            {technologies.map((tech, i) => {
              const Icon = tech.icon;
              // Stack icons in a circle
              const angle = (i / technologies.length) * 2 * Math.PI;
              const radius = 36;
              const x = Math.round(Math.cos(angle) * radius);
              const y = Math.round(Math.sin(angle) * radius);
              return (
                <span
                  key={tech.name}
                  className="absolute"
                  style={{ left: 48 + x, top: 48 + y }}
                >
                  <Icon size={28} style={{ color: tech.color, filter: 'grayscale(0.3) opacity(0.7)' }} className="drop-shadow" />
                </span>
              );
            })}
            {/* Center icon */}
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Code size={36} className="text-highlight drop-shadow-lg" />
            </span>
          </div>
          <div className="text-xs text-foreground/60 font-mono text-center max-w-xs">
            This project is built with modern web technologies and open source tools.<br />
            Thanks to the amazing OSS community!
          </div>
        </div>

        {/* Technology List */}
        <div>
          <h3 className="text-highlight font-bold mb-2 font-mono text-xs text-center">built with</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {technologies.map((tech) => {
              const Icon = tech.icon;
              return (
                <div
                  key={tech.name}
                  className="flex items-center gap-3 p-2 rounded border border-secondary/30 hover:border-highlight/50 transition-all bg-background/80"
                >
                  <Icon size={20} style={{ color: tech.color, filter: 'grayscale(0.3) opacity(0.7)' }} className="shrink-0" />
                  <div className="font-mono text-xs">
                    <p className="text-foreground font-bold">{tech.name}</p>
                    <p className="text-foreground/60 text-xs">{tech.description}</p>
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

