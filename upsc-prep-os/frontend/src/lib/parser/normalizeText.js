/**
 * normalizeText.js
 * Cleans and normalizes raw extracted PDF text for UPSC question parsing.
 */

/**
 * Main normalization pipeline
 * @param {string} raw - Raw text from PDF extractor
 * @returns {string} - Normalized text
 */
export function normalizeText(raw) {
  if (!raw || typeof raw !== "string") return "";

  let text = raw;

  // ── 1. Normalize line endings ──────────────────────────────────────────────
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // ── 2. Fix broken words (hyphenated line-breaks from PDF column layout) ────
  //   "environ-\nment" → "environment"
  text = text.replace(/(\w)-\n(\w)/g, "$1$2");

  // ── 3. Collapse excessive blank lines (keep max 2) ────────────────────────
  text = text.replace(/\n{3,}/g, "\n\n");

  // ── 4. Remove common PDF artifacts ────────────────────────────────────────
  //   Page headers / footers like "Page 1 of 50", "www.example.com", etc.
  text = text.replace(/^Page\s+\d+(\s+of\s+\d+)?\s*$/gim, "");
  text = text.replace(/^\s*https?:\/\/\S+\s*$/gim, "");
  text = text.replace(/^\s*www\.\S+\s*$/gim, "");

  // ── 5. Remove watermarks / repeated short lines ───────────────────────────
  text = text.replace(/^(IAS|UPSC|PYQ|PRELIMS|MAINS)\s*$/gim, "");

  // ── 6. Normalize option labels to consistent format ───────────────────────
  //   "(a)" / "a)" / "A)" / "(A)" / "1." → "(a)"
  text = text.replace(/^\s*\(([abcdABCD])\)\s*/gm, "($1) ");
  text = text.replace(/^\s*([abcdABCD])\)\s*/gm, "($1) ");
  text = text.replace(/^\s*([abcdABCD])\.\s+/gm, "($1) ");

  // ── 7. Normalize answer markers ───────────────────────────────────────────
  //   "Answer: (c)", "Ans.(B)", "Answer key: C" → "Ans: C"
  text = text.replace(
    /\b(?:Answer\s*key|Answer|Ans(?:wer)?)\s*[:\.\)]\s*\(?([abcdABCD])\)?/gi,
    "Ans: $1"
  );

  // ── 8. Normalize explanation markers ─────────────────────────────────────
  text = text.replace(
    /\b(?:Explanation|Exp(?:lanation)?|Solution|Rationale)\s*[:\-]\s*/gi,
    "Explanation: "
  );

  // ── 9. Remove stray page numbers inline ──────────────────────────────────
  text = text.replace(/\n\s*\d{1,3}\s*\n/g, "\n");

  // ── 10. Fix spaces around punctuation ────────────────────────────────────
  text = text.replace(/\s{2,}/g, " ");

  // ── 11. Trim lines ────────────────────────────────────────────────────────
  text = text
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n");

  return text.trim();
}

/**
 * Detect the exam year from text context
 * @param {string} text
 * @returns {number|null}
 */
export function detectYear(text) {
  // Explicit year markers
  const markerMatch = text.match(
    /(?:UPSC\s+)?(?:IAS|CSE|CAPF|CDS|NDA)?\s*(?:Prelims?|Mains?|GS)?\s*(?:Paper\s*[I1]?)?\s*[–\-]?\s*(20\d{2}|19\d{2})/i
  );
  if (markerMatch) return parseInt(markerMatch[1]);

  // Fallback: first 4-digit year in range
  const years = [...text.matchAll(/\b((?:19|20)\d{2})\b/g)]
    .map((m) => parseInt(m[1]))
    .filter((y) => y >= 1979 && y <= new Date().getFullYear());

  if (years.length) return years[0];
  return null;
}

/**
 * Strip question number prefix from a question string
 * @param {string} str
 * @returns {string}
 */
export function stripQuestionNumber(str) {
  return str.replace(/^\s*\d{1,3}\s*[\.\)]\s*/, "").trim();
}