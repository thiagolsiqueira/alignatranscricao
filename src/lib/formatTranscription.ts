const SENTENCES_PER_PARAGRAPH = 3;
const MAX_PARAGRAPH_CHARS = 420;

/**
 * Melhora a legibilidade do texto transcrito:
 * - normaliza espaços;
 * - divide em frases;
 * - organiza em parágrafos curtos.
 */
export function formatTranscriptionText(rawText: string): string {
  const normalized = (rawText || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!normalized) return "";

  // Se já veio com parágrafos, só normaliza os blocos.
  if (normalized.includes("\n\n")) {
    return normalized
      .split(/\n{2,}/)
      .map((chunk) => chunk.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .join("\n\n");
  }

  const punctuated = normalized
    .replace(/([.!?])\s+(?=[A-ZÀ-Ý0-9])/g, "$1\n")
    .replace(/\n{2,}/g, "\n");

  const sentences = punctuated
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (sentences.length <= 1) return punctuated;

  const paragraphs: string[] = [];
  let current = "";
  let count = 0;

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    const reachedSentenceLimit = count >= SENTENCES_PER_PARAGRAPH;
    const reachedCharLimit = current.length >= MAX_PARAGRAPH_CHARS;

    if (current && (reachedSentenceLimit || reachedCharLimit)) {
      paragraphs.push(current.trim());
      current = sentence;
      count = 1;
      continue;
    }

    current = candidate;
    count += 1;
  }

  if (current) paragraphs.push(current.trim());

  return paragraphs.join("\n\n");
}
