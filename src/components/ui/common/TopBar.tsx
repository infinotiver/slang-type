import { TbArrowLeft } from "react-icons/tb";

interface TopBarProps {
  title: string;
  onBack: () => void;
}

export default function TopBar({ title, onBack }: TopBarProps) {
  return (
    <header className="py-1 sm:py-2 border-b border-secondary">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-foreground hover:text-highlight transition-colors active:scale-95 -ml-2"
          aria-label="back"
        >
          <TbArrowLeft size={24} />
        </button>
        <h1 className="text-lg sm:text-xl font-bold tracking-wider">{title}</h1>
      </div>
    </header>
  );
}
