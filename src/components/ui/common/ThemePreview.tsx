export function ThemePreview({ theme }: { theme: string }) {
  return (
    <span
      data-theme={theme}
      className="theme-preview inline-flex gap-1 rounded-full"
    >
      <span
        className="h-3 w-3 rounded-full border border-black/10"
        style={{ background: "var(--preview-background)" }}
      />
      <span
        className="h-3 w-3 rounded-full border border-black/10"
        style={{ background: "var(--preview-accent)" }}
      />
      <span
        className="h-3 w-3 rounded-full border border-black/10"
        style={{ background: "var(--preview-highlight)" }}
      />
    </span>
  );
}
