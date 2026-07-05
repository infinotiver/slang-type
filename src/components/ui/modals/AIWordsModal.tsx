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

  const handleGenerateWords = async () => {
    if (!theme.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!geminiService) {
        throw new Error("AI service is unavailable.");
      }

      const result = await geminiService.generateWords({
        theme: theme.trim(),
        wordCount: targetWordCount,
      });

      onWordsGenerated(result.words, result.theme);
      setTheme("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate words.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="generate with ai"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 font-mono">
        <div>
          <label className="mb-2 block text-xs text-foreground/50">
            Prompt
          </label>

          <textarea
            value={theme}
            onChange={(e) => {
              setTheme(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleGenerateWords();
              }
            }}
            placeholder="e.g. space exploration, startups, ancient rome, cats..."
            rows={4}
            maxLength={200}
            disabled={loading}
            autoFocus
            className="w-full resize-none rounded-lg border border-secondary/40 bg-background/60 px-3 py-3 text-sm outline-none transition-colors focus:border-highlight/60"
          />

          <div className="mt-2 flex items-center justify-between text-xs text-foreground/40">
            <span>
              {mode} • {targetWordCount} words
            </span>

            <span>{theme.length}/200</span>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-secondary/30 bg-secondary/10 p-3 text-xs text-foreground/60">
          <TbLock className="mt-0.5 shrink-0" size={14} />

          <p>
            Your prompt is sent to Google's Gemini API to generate the typing
            test.
            <a
              href="https://ai.google.dev/gemini-api/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-highlight hover:underline"
            >
              Learn more
            </a>
          </p>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleGenerateWords}
            disabled={loading || !theme.trim()}
            className="min-w-28"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                Generating
              </span>
            ) : (
              "Generate"
            )}
          </Button>
        </div>
      </div>
    </ModalBase>
  );
}
