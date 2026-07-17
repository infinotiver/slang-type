interface ButtonGroupOption<T> {
  label: string;
  value: T;
}

interface ButtonGroupProps<T> {
  options: ButtonGroupOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

export default function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: ButtonGroupProps<T>) {

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-xs uppercase tracking-wider text-foreground/50 font-mono">
          {label}
        </p>
      )}

      <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={[
                "inline-flex items-center gap-2 rounded-lg border border-secondary/40 px-4 py-2 text-xs",
                selected
                  ? "border-highlight bg-background"
                  : "bg-background/40",
              ].join(" ")}
            >
              <span className="capitalize">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
