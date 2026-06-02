import { stripQuestionNumber } from "./normalizeText.js";

// ─────────────────────────────────────────────────────────────────────────────
// REGEX CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Matches lines like "1.", "2)", "Q.3", "Q3.", "3. " at the start */
const Q_NUMBER_RE = /^(?:Q\.?\s*)?\d{1,3}\s*[\.\)]\s+\S/;

/** Matches option lines: "(a)", "(b)", "(c)", "(d)" */
const OPTION_RE = /^\([abcdABCD]\)\s+/;

/** Matches answer line */
const ANS_RE = /^Ans\s*:/i;

/** Matches explanation line */
const EXP_RE = /^Explanation\s*:/i;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SPLITTER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Split a normalized text body into raw question blocks.
 * @param {string} normalizedText
 * @returns {string[]} Array of raw question block strings
 */
export function splitIntoBlocks(normalizedText) {
  const lines = normalizedText.split("\n");
  const blocks = [];
  let current = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // A new question starts when we see a question-number line
    // AND we already have content in the current block
    if (Q_NUMBER_RE.test(trimmed) && current.length > 0) {
      const block = current.join("\n").trim();
      if (block) blocks.push(block);
      current = [line];
    } else {
      current.push(line);
    }
  }

  // Push final block
  if (current.length > 0) {
    const block = current.join("\n").trim();
    if (block) blocks.push(block);
  }

  return blocks.filter((b) => b.length > 20);
}

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION TYPE DETECTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect UPSC question type from block text.
 * @param {string} block
 * @returns {'mcq'|'match'|'assertion'|'statement'|'table'|'map'|'multi-statement'}
 */
export function detectQuestionType(block) {
  const lower = block.toLowerCase();

  if (
    /\bcolumn[\s\-]*i\b.*\bcolumn[\s\-]*ii\b/is.test(block) ||
    /match\s+(the\s+)?(?:following|list|column)/i.test(block)
  )
    return "match";

  if (
    /\bassertion\s*[\(:]?\s*[A-Z]?\s*[\):]/.test(block) ||
    /\breason\s*[\(:]?\s*[A-Z]?\s*[\):]/.test(block) ||
    /\(r\)\s*:/.test(lower) ||
    /\(a\)\s*:.*\(r\)\s*:/s.test(lower)
  )
    return "assertion";

  const statementMatches = block.match(
    /(?:statement|consider\s+the\s+following).*?\n(?:[\d\.\)]+|\s*[IVX]+\.)\s+/is
  );
  if (statementMatches) return "statement";

  // Multi-statement: numbered list before options
  const numberedBeforeOptions =
    /(?:\n\s*[1-9]\.\s+[^\n]{10,}){2,}/s.test(block) &&
    OPTION_RE.test(block);
  if (numberedBeforeOptions) return "multi-statement";

  if (/table/i.test(block) && /\|/.test(block)) return "table";

  if (/map|figure|diagram/i.test(block)) return "map";

  return "mcq";
}