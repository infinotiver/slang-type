import data from "../data/data.json";

interface TokenizedData {
  slang: string[];
  english: string[];
}

const jsSnippets = [
  "const count = items.length ;",
  "let total = 0 ;",
  "for ( const value of list ) total += value ;",
  "if ( user ) return user.name ;",
  "const isReady = status === 'ready' ;",
  "const id = Math.random ( ) ;",
  "try { runTask ( ) ; } catch ( err ) { log ( err ) ; }",
  "const msg = `hello ${name}` ;",
  "function sum ( a , b ) { return a + b ; }",
  "const result = value ?? fallback ;",
  "obj.key = nextValue ;",
  "const ok = Number.isFinite ( value ) ;",
  "setTimeout ( update , 300 ) ;",
  "const now = Date.now ( ) ;",
  "const json = JSON.stringify ( payload ) ;",
  "await fetch ( url ) ;",
  "const parsed = JSON.parse ( raw ) ;",
  "const hasItem = set.has ( key ) ;",
];

function normalizeText(text: string): string {
  return text
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z\s]/g, "") // Remove numbers and special characters
    .trim(); // Remove extra spaces
}

function generateJavaScriptPhrase(targetWords: number): string {
  const tokens: string[] = [];

  while (tokens.length < targetWords) {
    const randomIndex = Math.floor(Math.random() * jsSnippets.length);
    const snippetTokens = jsSnippets[randomIndex].split(" ");
    tokens.push(...snippetTokens);
  }

  return tokens.slice(0, targetWords).join(" ");
}

export function generatePhrase(
  type: "slang" | "english" | "code",
  targetWords: number,
): string {
  if (type === "code") {
    return generateJavaScriptPhrase(targetWords);
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
  return normalizeText(phrase); // Normalize the generated phrase
}
