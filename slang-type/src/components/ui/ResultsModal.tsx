interface ResultsModalProps {
  wpm: number;
  accuracy: number;
  errors: number;
  onReset: () => void;
}

export default function ResultsModal({
  wpm,
  accuracy,
  errors,
  onReset,
}: ResultsModalProps) {
  return (
    <div className="text-center space-y-6">
      {/* Results grid - WPM, Accuracy, Errors */}
      <div className="grid grid-cols-3 gap-8">
        <div>
          <div className="text-xs text-foreground tracking-wider">wpm</div>
          <div className="text-4xl font-bold text-highlight">{wpm}</div>
        </div>
        <div>
          <div className="text-xs text-foreground tracking-wider">acc</div>
          <div className="text-4xl font-bold text-highlight">{accuracy}%</div>
        </div>
        <div>
          <div className="text-xs text-foreground tracking-wider">errors</div>
          <div className="text-4xl font-bold text-highlight">{errors}</div>
        </div>
      </div>

      {/* Retry button */}
      <button
        onClick={onReset}
        className="px-6 py-2 border-2 border-highlight text-highlight font-mono text-sm tracking-wider hover:bg-secondary transition-all"
      >
        try_again
      </button>
    </div>
  );
}
