import data from "../data/data.json";

interface TokenizedData {
  slang: string[];
  english: string[];
}

export function generatePhrase(
  type: "slang" | "english" | "code",
  targetWords: number,
): string {
  const words = data[type as keyof TokenizedData];

  if (!words || !words.length || targetWords <= 0) {
    return "";
  }

  const result: string[] = [];

  while (result.length < targetWords) {
    const randomIndex = Math.floor(Math.random() * words.length);
    result.push(words[randomIndex]);
  }

  return result.join(" ");
}
