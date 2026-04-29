import Button from "./Button";

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
          <Button
            key={option.value}
            onClick={() => onChange(option.value)}
            variant={value === option.value ? "primary" : "secondary"}
            className={value === option.value ? "font-semibold" : ""}
          >
            {isThemeGroup && (
              <span
                className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
                style={{
                  backgroundColor: themeColors[option.value] || "#fff000",
                }}
              />
            )}
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
