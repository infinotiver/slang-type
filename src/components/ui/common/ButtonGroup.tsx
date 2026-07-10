import { CheckIcon } from "lucide-react";
import { THEMES } from "@/types";
import { ThemePreview } from "./ThemePreview";

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
  const isThemeGroup = label?.toLowerCase() === "theme";

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-xs uppercase tracking-wider text-foreground/50 font-mono">
          {label}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;

          const isTheme =
            isThemeGroup &&
            THEMES.includes(option.value as (typeof THEMES)[number]);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={[
                "inline-flex items-center gap-2 rounded-full px-4 py-2",
                "border font-mono text-sm",
                "transition-all duration-150",
                selected
                  ? "border-highlight bg-secondary shadow-[0_0_0_1px_var(--color-highlight)]"
                  : "border-secondary bg-secondary hover:border-accent",
              ].join(" ")}
            >
              <span
                className={[
                  "flex items-center justify-center transition-all",
                  selected
                    ? "opacity-100 w-4"
                    : "opacity-0 w-0 overflow-hidden",
                ].join(" ")}
              >
                <CheckIcon size={14} className="text-highlight" />
              </span>

              {isTheme && (
                <div>
                  <ThemePreview theme={option.value} />
                </div>
              )}

              <span className="capitalize">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
