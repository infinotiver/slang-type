import type { ReactNode } from "react";
import { TbX } from "react-icons/tb";
import { AnimatePresence, motion } from "framer-motion";

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function ModalBase({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
}: ModalBaseProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-gradient-to-br from-background/80 via-secondary/60 to-background/90 backdrop-blur-[3px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          />
          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.28, ease: "anticipate" }}
          >
            <div
              className={`bg-background/95 border border-secondary rounded-xl p-6 sm:p-8 w-full ${maxWidth} shadow-2xl pointer-events-auto max-h-[90vh] sm:max-h-[80vh] overflow-y-auto custom-scroll`}
              style={{ scrollbarWidth: "thin", scrollbarColor: "#888 #222" }}
            >
              <style>{`
                .custom-scroll::-webkit-scrollbar {
                  width: 8px;
                  background: transparent;
                }
                .custom-scroll::-webkit-scrollbar-thumb {
                  background: linear-gradient(135deg, #8888, #4448 80%);
                  border-radius: 6px;
                }
                .custom-scroll::-webkit-scrollbar-thumb:hover {
                  background: linear-gradient(135deg, #aaa, #666 80%);
                }
                .custom-scroll {
                  scrollbar-width: thin;
                  scrollbar-color: #888 #222;
                }
              `}</style>
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h2 className="text-base sm:text-lg font-bold font-mono">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="text-foreground/60 hover:text-highlight transition-colors active:scale-95 p-1"
                  aria-label="close"
                >
                  <TbX size={20} className="text-inherit" />
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
