export const calculateAccuracy = (
  totalTyped: number,
  errors: number,
): number => {
  if (totalTyped === 0) return 0;

  const correctTyped = totalTyped - errors;
  const accuracy = (correctTyped / totalTyped) * 100;

  return Math.max(0, Math.round(accuracy));
};

export function calculateWPM(correctChars: number, elapsedSeconds: number) {
  if (elapsedSeconds <= 0) return 0;
  const words = correctChars / 5;
  const minutes = elapsedSeconds / 60;
  return Math.round(words / minutes || 0);
}
