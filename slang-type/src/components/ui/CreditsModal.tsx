import {
  TbX,
  TbBrandReact,
  TbBrandTypescript,
  TbBrandTailwind,
  TbBrandVite,
  TbPalette,
  TbChartLine,
} from "react-icons/tb";

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
  if (!isOpen) return null;

  const technologies = [
    { name: "React 19", description: "UI library", icon: TbBrandReact },
    { name: "TypeScript", description: "type safety", icon: TbBrandTypescript },
    { name: "Tailwind CSS", description: "styling", icon: TbBrandTailwind },
    { name: "Vite", description: "build tool", icon: TbBrandVite },
    { name: "Tabler Icons", description: "icon set", icon: TbPalette },
    { name: "Recharts", description: "data visualization", icon: TbChartLine },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
        <div className="bg-background border border-secondary rounded-lg p-6 sm:p-8 w-full max-w-2xl shadow-lg pointer-events-auto max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-bold font-mono">
              credits
            </h2>
            <button
              onClick={onClose}
              className="text-foreground hover:text-highlight transition-colors active:scale-95 p-1"
              aria-label="close"
            >
              <TbX size={20} />
            </button>
          </div>

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
                      <Icon
                        size={18}
                        className="text-highlight flex-shrink-0"
                      />
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
        </div>
      </div>
    </>
  );
}
