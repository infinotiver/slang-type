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
            className="fixed inset-0 backdrop-blur-sm z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div
              className={`bg-background border border-secondary rounded-lg p-6 sm:p-8 w-full ${maxWidth} shadow-lg pointer-events-auto max-h-[90vh] sm:max-h-[80vh] overflow-y-auto`}
            >
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h2 className="text-base sm:text-lg font-bold font-mono">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="text-foreground hover:text-highlight transition-colors active:scale-95 p-1"
                  aria-label="close"
                >
                  <TbX size={20} />
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
