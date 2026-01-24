import data from "../data/data.json";

interface TokenizedData {
  slang: string[];
  english: string[];
}

interface RawItem {
  id: string;
  text: string;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

const tokenizedData: TokenizedData = {
  slang: [],
  english: [],
};

(data as RawItem[]).forEach((item) => {
  const words = tokenize(item.text);

  if (item.id.startsWith("slang")) {
    tokenizedData.slang.push(...words);
  }

  if (item.id.startsWith("english")) {
    tokenizedData.english.push(...words);
  }
});

export function generatePhrase(
  type: keyof TokenizedData,
  targetWords: number,
): string {
  const words = tokenizedData[type];

  if (!words.length || targetWords <= 0) {
    return "";
  }

  const result: string[] = [];

  while (result.length < targetWords) {
    const randomIndex = Math.floor(Math.random() * words.length);
    result.push(words[randomIndex]);
  }

  return result.join(" ");
}
