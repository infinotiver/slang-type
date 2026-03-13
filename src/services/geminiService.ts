// Secure Gemini API integration for word generation
// Privacy-first: no console logging, secure API key handling, rate limiting

export interface GenerateWordsRequest {
  theme: string;
  wordCount: number;
}

export interface GenerateWordsResponse {
  words: string[];
  theme: string;
  timestamp: number;
}

interface ApiErrorResponse {
  error?: string;
}

export class GeminiServiceError extends Error {
  public code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "GeminiServiceError";
    this.code = code;
  }
}

export class GeminiService {
  private static readonly MAX_WORDS = 800;
  private static readonly MIN_WORDS = 5;

  constructor() {}

  private validateInput(theme: string, wordCount: number): void {
    if (!theme?.trim()) {
      throw new GeminiServiceError("Theme cannot be empty", "INVALID_THEME");
    }

    if (theme.length > 100) {
      throw new GeminiServiceError(
        "Theme must be less than 100 characters",
        "THEME_TOO_LONG",
      );
    }

    if (
      !Number.isInteger(wordCount) ||
      wordCount < GeminiService.MIN_WORDS ||
      wordCount > GeminiService.MAX_WORDS
    ) {
      throw new GeminiServiceError(
        `Word count must be between ${GeminiService.MIN_WORDS} and ${GeminiService.MAX_WORDS}`,
        "INVALID_WORD_COUNT",
      );
    }
  }

  private sanitizeTheme(theme: string): string {
    return theme
      .trim()
      .slice(0, 100)
      .replace(/[<>"'`;]/g, "");
  }

  async generateWords(
    request: GenerateWordsRequest,
  ): Promise<GenerateWordsResponse> {
    this.validateInput(request.theme, request.wordCount);

    const sanitizedTheme = this.sanitizeTheme(request.theme);

    try {
      const response = await fetch("/api/gemini-words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: sanitizedTheme,
          wordCount: request.wordCount,
        }),
      });

      if (!response.ok) {
        const apiError = (await response
          .json()
          .catch(() => ({}))) as ApiErrorResponse;
        const code = apiError.error;

        if (response.status === 429) {
          if (code === "provider_rate_limited") {
            throw new GeminiServiceError(
              "Gemini quota/rate limit reached. Try again later.",
              "PROVIDER_RATE_LIMIT",
            );
          }
          throw new GeminiServiceError(
            "Too many requests from this app. Please wait a minute.",
            "RATE_LIMIT",
          );
        }
        if (response.status === 401) {
          throw new GeminiServiceError(
            "Server is not configured",
            "UNAUTHORIZED",
          );
        }
        if (response.status === 400) {
          if (code === "invalid_theme") {
            throw new GeminiServiceError(
              "Theme is invalid. Please use a short text theme.",
              "INVALID_THEME",
            );
          }
          if (code === "invalid_word_count") {
            throw new GeminiServiceError(
              "Word count is outside allowed range.",
              "INVALID_WORD_COUNT",
            );
          }
          throw new GeminiServiceError(
            "Invalid request payload",
            "BAD_REQUEST",
          );
        }
        if (response.status === 415) {
          throw new GeminiServiceError(
            "Unsupported request format",
            "UNSUPPORTED_MEDIA_TYPE",
          );
        }
        if (response.status === 502) {
          if (code === "provider_error") {
            throw new GeminiServiceError(
              "Gemini provider error. Please retry in a moment.",
              "PROVIDER_ERROR",
            );
          }
          throw new GeminiServiceError(
            "Invalid response from Gemini provider.",
            "INVALID_PROVIDER_RESPONSE",
          );
        }
        if (response.status === 500) {
          throw new GeminiServiceError(
            "Server error while generating words",
            "SERVER_ERROR",
          );
        }
        throw new GeminiServiceError("Failed to generate words", "API_ERROR");
      }

      const data = (await response.json()) as GenerateWordsResponse;

      if (!data || !Array.isArray(data.words)) {
        throw new GeminiServiceError(
          "Invalid server response",
          "INVALID_RESPONSE",
        );
      }

      const words = data.words
        .slice(0, request.wordCount)
        .filter(
          (word: unknown): word is string =>
            typeof word === "string" &&
            /^[a-z]{2,20}$/i.test(word.toLowerCase()),
        );

      if (words.length === 0) {
        throw new GeminiServiceError(
          "No valid words generated",
          "NO_VALID_WORDS",
        );
      }

      return {
        words,
        theme: data.theme || sanitizedTheme,
        timestamp: data.timestamp || Date.now(),
      };
    } catch (error: unknown) {
      // Full raw error object
      console.error("[GeminiService] generateWords failed:", error);

      // Optional extra context (safe, no key)
      console.error("[GeminiService] request context:", {
        themeLength: request.theme?.length ?? 0,
        wordCount: request.wordCount,
      });

      if (error instanceof GeminiServiceError) {
        throw error;
      }

      throw new GeminiServiceError(
        error instanceof Error ? error.message : "Unknown error occurred",
        "UNKNOWN_ERROR",
      );
    }
  }
}

export const createGeminiService = (): GeminiService => {
  return new GeminiService();
};
