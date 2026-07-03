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

const themeColors: Record<string, string> = {
  dark: "#fff000",
  light: "#fca311",
  latte: "#dc8a78",
  frappe: "#f4b8e4",
  mocha: "#94e2d5",
  nord: "#88c0d0",
  gruvbox: "#fabd2f",
  bold: "#D71921",
};

export default function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: ButtonGroupProps<T>) {
  const isThemeGroup = label === "theme";

  return (
    <div>
      {label && (
        <label className="block text-sm font-mono text-foreground mb-2 tracking-wider">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={value === option.value ? "opacity-100" : "opacity-20"}
          >
            {isThemeGroup && (
              <span
                className="inline-block w-12 h-12 rounded-full mr-2 align-middle"
                style={{
                  backgroundColor: themeColors[option.value] || "#fff000",
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
