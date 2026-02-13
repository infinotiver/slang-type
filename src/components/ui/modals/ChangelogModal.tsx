import ModalBase from "./ModalBase";

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  changelog: string;
  version: string;
}

export default function ChangelogModal({
  isOpen,
  onClose,
  changelog,
  version,
}: ChangelogModalProps) {
  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={`Changelog — v${version}`}
      maxWidth="max-w-3xl"
    >
      <div className="text-xs sm:text-sm font-mono text-foreground/70 whitespace-pre-wrap leading-relaxed">
        {changelog}
      </div>
    </ModalBase>
  );
}
