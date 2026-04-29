import data from "../data/data.json";
import code_js from "../data/code_js.json";

interface TokenizedData {
  slang: string[];
  english: string[];
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim();
}

function generateCodePhrase(targetWords: number): string {
  const snippets = code_js.javascript;
  const tokens: string[] = [];

  while (tokens.length < targetWords) {
    const randomIndex = Math.floor(Math.random() * snippets.length);
    const snippetTokens = snippets[randomIndex].split(" ");
    tokens.push(...snippetTokens);
  }

  return tokens.slice(0, targetWords).join(" ");
}

export function generatePhrase(
  type: "slang" | "english" | "code",
  targetWords: number,
): string {
  if (type === "code") {
    return generateCodePhrase(targetWords);
  }

  const words = data[type as keyof TokenizedData];

  if (!words || !words.length || targetWords <= 0) {
    return "";
  }

  const result: string[] = [];

  while (result.length < targetWords) {
    const randomIndex = Math.floor(Math.random() * words.length);
    result.push(words[randomIndex]);
  }

  const phrase = result.join(" ");
  return normalizeText(phrase);
}
