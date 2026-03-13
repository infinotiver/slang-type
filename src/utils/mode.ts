import type { Mode } from "@shared-types/index";

export function getTargetWordsForMode(selectedMode: Mode): number {
  if (selectedMode === "inf") return 50;
  return Math.ceil((Number(selectedMode.replace("s", "")) / 15) * 100);
}
