import { useState } from "react";
import { TbLock } from "react-icons/tb";
import ModalBase from "./ModalBase";
import { Button } from "@components/ui/common";
import type { GeminiService } from "@/services/geminiService";
import type { Mode } from "@shared-types/index";

interface AIWordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWordsGenerated: (words: string[], theme: string) => void;
  geminiService?: GeminiService;
  mode: Mode;
  targetWordCount: number;
}

export default function AIWordsModal({
  isOpen,
  onClose,
  onWordsGenerated,
  geminiService,
  mode,
  targetWordCount,
}: AIWordsModalProps) {
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);

  const handleGenerateWords = async () => {
    if (!theme.trim()) {
      setError("Please enter a theme");
      return;
    }

    if (!agreedToDisclaimer) {
      setError("Please agree to the disclaimer");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const service: GeminiService | undefined = geminiService;

      if (!service) {
        setError("AI service is unavailable right now");
        setLoading(false);
        return;
      }

      const result = await service.generateWords({
        theme,
        wordCount: targetWordCount,
      });

      onWordsGenerated(result.words, result.theme);
      setTheme("");
      setAgreedToDisclaimer(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to generate words");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full px-3 py-2.5 bg-background/60 border border-secondary/50 rounded-lg text-sm font-mono text-foreground placeholder-foreground/25 focus:outline-none focus:border-highlight/50 transition-colors disabled:opacity-40";

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="ai words"
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        {/* Theme */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline">
            <label className="text-xs font-mono text-foreground/40 uppercase tracking-widest">
              theme
            </label>
            <span className="text-xs font-mono text-foreground/25">
              {theme.length}/100
            </span>
          </div>
          <input
            type="text"
            value={theme}
            onChange={(e) => {
              setTheme(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleGenerateWords()}
            placeholder="animals, sci-fi, cooking..."
            maxLength={100}
            disabled={loading}
            autoFocus
            className={inputClass}
          />
        </div>

        {/* Mode-based Word Count */}
        <div className="rounded-lg border border-secondary/40 bg-secondary/10 px-3 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-foreground/40 uppercase tracking-widest">
              mode
            </span>
            <span className="text-xs font-mono text-foreground">{mode}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs font-mono text-foreground/40 uppercase tracking-widest">
              words
            </span>
            <span className="text-sm font-mono text-highlight">
              {targetWordCount}
            </span>
          </div>
        </div>

        {/* Privacy + Agree */}
        <div className="space-y-2.5">
          <div className="flex gap-2 items-start text-xs text-foreground/50">
            <TbLock size={12} className="shrink-0 mt-0.5" />
            <span>
              Google may use your theme to{" "}
              <a
                href="https://ai.google.dev/gemini-api/terms"
                className="text-highlight"
              >
                improve their AI models.
              </a>{" "}
              Don't submit personal info.
            </span>
          </div>
          <label className="flex items-center gap-2 text-xs font-mono text-foreground/50 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={agreedToDisclaimer}
              onChange={(e) => setAgreedToDisclaimer(e.target.checked)}
              disabled={loading}
              className="accent-highlight"
            />
            <span className="group-hover:text-foreground transition-colors">
              i understand
            </span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs font-mono text-red-400/80 -mt-2">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            onClick={handleGenerateWords}
            variant="primary"
            disabled={loading || !agreedToDisclaimer}
            className="flex-1 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                generating...
              </>
            ) : (
              <>generate</>
            )}
          </Button>
          <Button onClick={onClose} variant="secondary" disabled={loading}>
            cancel
          </Button>
        </div>
      </div>
    </ModalBase>
  );
}
