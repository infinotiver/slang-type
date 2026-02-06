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

export default function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: ButtonGroupProps<T>) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-mono text-foreground/70 mb-2 tracking-wider">
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
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
