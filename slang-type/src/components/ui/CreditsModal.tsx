import { TbX } from "react-icons/tb";

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
  if (!isOpen) return null;

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

          <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm font-mono">
            <div>
              <h3 className="text-highlight font-bold mb-2">built with</h3>
              <ul className="text-foreground/80 space-y-1">
                <li>• React 19 - UI library</li>
                <li>• TypeScript - type safety</li>
                <li>• Tailwind CSS - styling</li>
                <li>• Vite - build tool</li>
                <li>• Tabler Icons - icon set</li>
                <li>• Recharts - data visualization</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-secondary/40">
              <p className="text-foreground/60 text-xs">
                made with love by{" "}
                <a
                  href="https://github.com/infinotiver"
                  className="hover:text-highlight transition-colors"
                >
                  infinotiver
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
