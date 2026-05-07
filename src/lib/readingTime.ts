const WORDS_PER_MINUTE = 200;

/** Returns estimated reading time in minutes (minimum 1). */
export function estimateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}
