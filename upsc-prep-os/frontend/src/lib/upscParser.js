function normalizeText(raw) {
  if (!raw || typeof raw !== "string") return "";
  let t = raw;

  t = t.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Fix OCR line-break inside words: "environ-\nment" → "environment"
  t = t.replace(/(\w)-\n(\w)/g, "$1$2");

  // Strip bare page markers (from both native and OCR)
  t = t.replace(/^\s*Page\s+\d+\s*$/gim, "");

  // Strip headers / footers / watermarks
  t = t.replace(/^.*?(UPSC|IAS|PYQ|PRELIMS|MAINS|www\.|http).*?$/gim, "");

  // Collapse 3+ blank lines → 2
  t = t.replace(/\n{3,}/g, "\n\n");

  // ── Normalise option labels to consistent "(a) " format ──────────────────
  // Handles: (a), a), A), (A), a., A. — with optional leading spaces
  t = t.replace(/^\s*\(([abcdABCD])\)[\.:]?\s*/gm, "($1) ");
  t = t.replace(/^\s*([abcdABCD])\)[\.:]?\s*/gm,   "($1) ");
  t = t.replace(/^\s*([abcdABCD])\.[\.:]?\s+/gm,   "($1) ");

  // OCR often produces "(4)" for "(d)" — remap common misreads
  t = t.replace(/^\s*\(1\)\s*/gm, "(a) ");
  t = t.replace(/^\s*\(2\)\s*/gm, "(b) ");
  t = t.replace(/^\s*\(3\)\s*/gm, "(c) ");
  t = t.replace(/^\s*\(4\)\s*/gm, "(d) ");

  // ── Normalise answer markers ──────────────────────────────────────────────
  t = t.replace(
    /\b(?:Answer(?:\s*key)?|Ans(?:wer)?)\s*[:\.\)]\s*\(?([abcdABCD1-4])\)?/gi,
    (_, x) => {
      const map = { "1": "A", "2": "B", "3": "C", "4": "D" };
      return "Ans: " + (map[x] || x.toUpperCase());
    }
  );

  // ── Normalise explanation markers ─────────────────────────────────────────
  t = t.replace(
    /\b(?:Explanation|Exp(?:lanation)?|Solution|Rationale|Reason)\s*[:\-]\s*/gi,
    "Explanation: "
  );

  // Collapse multiple spaces
  t = t.replace(/[^\S\n]{2,}/g, " ");

  // Trim trailing whitespace per line
  t = t.split("\n").map((l) => l.trimEnd()).join("\n").trim();

  return t;
}

function detectYear(text) {
  const m = text.match(
    /(?:UPSC|CSE|IAS|CAPF)?\s*(?:Prelims?|Mains?)?\s*[–\-]?\s*(20\d{2}|19\d{2})/i
  );
  if (m) return parseInt(m[1]);
  const years = [...text.matchAll(/\b((?:19|20)\d{2})\b/g)]
    .map((x) => parseInt(x[1]))
    .filter((y) => y >= 1979 && y <= new Date().getFullYear());
  return years[0] ?? null;
}

function stripQuestionNumber(s) {
  return s.replace(/^\s*(?:Q\.?\s*)?\d{1,3}\s*[\.\)]\s*/, "").trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// ❷  SPLITTER  ─ handles both "1." and "1)" numbering, with/without "Q"
// ─────────────────────────────────────────────────────────────────────────────

// A line that STARTS a new question
const Q_START_RE = /^(?:Q\.?\s*)?\d{1,3}\s*[\.\)]\s+\S/;

function splitIntoBlocks(text) {
  const lines = text.split("\n");
  const blocks = [];
  let cur = [];

  for (const line of lines) {
    if (Q_START_RE.test(line.trim()) && cur.length > 0) {
      const b = cur.join("\n").trim();
      if (b.length > 15) blocks.push(b);
      cur = [line];
    } else {
      cur.push(line);
    }
  }
  if (cur.length) {
    const b = cur.join("\n").trim();
    if (b.length > 15) blocks.push(b);
  }
  return blocks;
}

function detectQuestionType(block) {
  const lo = block.toLowerCase();
  if (/column[\s-]*i.*column[\s-]*ii/is.test(lo) || /match\s+(the\s+)?(?:following|list)/i.test(lo))
    return "match";
  if (/\basssertion|\bstatement[\s(]?[a]/i.test(lo) && /\breason|\bstatement[\s(]?[r]/i.test(lo))
    return "assertion";
  if (/consider\s+the\s+following|which\s+of\s+the\s+(above|following)\s+statement/i.test(lo))
    return "statement";
  if (/\|/.test(block) && /table/i.test(lo)) return "table";
  if (/map|figure|diagram/i.test(lo)) return "map";
  return "mcq";
}

// ─────────────────────────────────────────────────────────────────────────────
// ❸  CLASSIFIER
// ─────────────────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { subject: "History",              topic: "Ancient History",           re: /maurya|gupta|harappa|vedic|indus valley|ashoka|chandragupta/i },
  { subject: "History",              topic: "Medieval History",          re: /mughal|delhi sultanate|akbar|aurangzeb|vijayanagara|chola/i },
  { subject: "History",              topic: "Modern History",            re: /british|colonial|1857|quit india|gandhi|nehru|independence|partition/i },
  { subject: "History",              topic: "Art & Culture",             re: /temple|architecture|dance|music|painting|sculpture|festival|craft/i },
  { subject: "Geography",            topic: "Physical Geography",        re: /river|mountain|plateau|ocean|climate|monsoon|soil|mineral|volcano/i },
  { subject: "Geography",            topic: "Economic Geography",        re: /agriculture|irrigation|dam|crop|industry|transport|port/i },
  { subject: "Geography",            topic: "World Geography",           re: /continent|capital city|latitude|longitude|time zone|ocean current/i },
  { subject: "Polity",               topic: "Constitutional Provisions", re: /constitution|article \d+|fundamental right|directive|parliament|amendment/i },
  { subject: "Polity",               topic: "Governance",                re: /panchayat|municipality|election commission|judiciary|lok sabha|rajya sabha/i },
  { subject: "Economy",              topic: "Indian Economy",            re: /gdp|inflation|rbi|monetary|fiscal|budget|gst|five.year plan/i },
  { subject: "Economy",              topic: "International Economy",     re: /wto|imf|world bank|forex|balance of payment/i },
  { subject: "Science & Technology", topic: "General Science",           re: /atom|molecule|cell|dna|virus|bacteria|acid|base/i },
  { subject: "Science & Technology", topic: "Technology",                re: /satellite|missile|nuclear|isro|drdo|nanotechnology|biotechnology/i },
  { subject: "Environment",          topic: "Ecology & Biodiversity",    re: /ecosystem|biodiversity|species|wildlife|tiger|forest|biosphere/i },
  { subject: "Environment",          topic: "Climate & Environment",     re: /climate change|global warming|carbon|emission|ozone|pollution/i },
  { subject: "Current Affairs",      topic: "International Relations",   re: /bilateral|summit|treaty|nato|asean|saarc|brics|g20|united nations/i },
];

function classify(text) {
  for (const { subject, topic, re } of SUBJECTS) {
    if (re.test(text)) return { subject, topic, subTopic: "" };
  }
  return { subject: "General Studies", topic: "Miscellaneous", subTopic: "" };
}

// ─────────────────────────────────────────────────────────────────────────────
// ❹  EXTRACTORS
// ─────────────────────────────────────────────────────────────────────────────

const LABELS    = ["A", "B", "C", "D"];
const OPT_RE    = /^\s*\(([abcdABCD])\)\s*(.*)/;
const ANS_RE    = /^Ans\s*:\s*\(?([abcdABCDabcd])\)?/i;
const EXP_RE    = /^Explanation\s*:\s*/i;

function extractOptions(block) {
  const lines = block.split("\n");
  const opts   = [];
  const used   = new Set();

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(OPT_RE);
    if (!m) continue;
    const label = m[1].toUpperCase();
    let text = m[2].trim();
    used.add(i);

    // Grab continuation lines
    let j = i + 1;
    while (
      j < lines.length &&
      !OPT_RE.test(lines[j]) &&
      !ANS_RE.test(lines[j]) &&
      !EXP_RE.test(lines[j]) &&
      lines[j].trim() !== ""
    ) {
      text += " " + lines[j].trim();
      used.add(j);
      j++;
    }
    opts.push({ label, text: text.trim() });
  }

  // Fill in any missing labels
  const found = new Set(opts.map((o) => o.label));
  for (const lbl of LABELS) if (!found.has(lbl)) opts.push({ label: lbl, text: "" });
  opts.sort((a, b) => LABELS.indexOf(a.label) - LABELS.indexOf(b.label));

  return {
    options: opts,
    remainingBlock: lines.filter((_, i) => !used.has(i)).join("\n"),
  };
}

function extractAnswer(block) {
  const lines = block.split("\n");
  let ans = null;
  const kept = [];
  for (const l of lines) {
    const m = l.match(ANS_RE);
    if (m) { ans = m[1].toUpperCase(); }
    else   { kept.push(l); }
  }
  return { correctOption: ans, block: kept.join("\n") };
}

function extractExplanation(block) {
  const lines = block.split("\n");
  let exp = "";
  let inExp = false;
  const kept = [];
  for (const l of lines) {
    if (EXP_RE.test(l)) {
      inExp = true;
      exp = l.replace(EXP_RE, "").trim();
    } else if (inExp) {
      if (Q_START_RE.test(l.trim()) || l.trim() === "") { inExp = false; kept.push(l); }
      else exp += " " + l.trim();
    } else {
      kept.push(l);
    }
  }
  return { explanation: exp.trim(), block: kept.join("\n") };
}

function extractStatements(text) {
  const re = /(?:\n|^)\s*(?:\d+\.|[IVX]+\.)\s+([^\n]+)/g;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[1].trim());
  return out;
}

function extractMatchPairs(block) {
  const out = [];
  const re = /([A-D])\.\s+([^\n\t]+)\s+(\d)\.\s+([^\n]+)/g;
  let m;
  while ((m = re.exec(block)) !== null)
    out.push({ leftLabel: m[1], left: m[2].trim(), rightLabel: m[3], right: m[4].trim() });
  return out;
}

function extractTable(block) {
  const rows = block.split("\n").filter((l) => l.includes("|"));
  if (rows.length < 2) return null;
  const parse = (l) => l.split("|").map((c) => c.trim()).filter(Boolean);
  return {
    headers: parse(rows[0]),
    rows: rows.slice(1).filter((l) => !/^[\s|\-]+$/.test(l)).map(parse),
  };
}

function blockYear(block) {
  const m = block.match(/\[?\b(20\d{2}|19\d{2})\b\]?/);
  return m ? parseInt(m[1]) : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ❺  VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

function validate(q) {
  const w = [];
  if (!q.questionText || q.questionText.length < 10) w.push("MISSING_QUESTION_TEXT");
  if (q.options.filter((o) => o.text).length < 2)    w.push("INSUFFICIENT_OPTIONS");
  if (q.options.filter((o) => o.text).length < 4)    w.push("INCOMPLETE_OPTIONS");
  if (!q.correctOption)                               w.push("MISSING_ANSWER");
  if (!q.explanation)                                 w.push("MISSING_EXPLANATION");
  if (!q.year)                                        w.push("MISSING_YEAR");
  return w;
}

// ─────────────────────────────────────────────────────────────────────────────
// ❻  BLOCK PARSER
// ─────────────────────────────────────────────────────────────────────────────

let _seq = 0;

function parseBlock(raw, idx, globalYear) {
  const { explanation, block: b1 } = extractExplanation(raw);
  const { correctOption, block: b2 } = extractAnswer(b1);
  const { options, remainingBlock: b3 } = extractOptions(b2);

  let questionText = b3
    .split("\n").filter((l) => l.trim()).join(" ")
    .replace(/\s{2,}/g, " ").trim();
  questionText = stripQuestionNumber(questionText);

  const type = detectQuestionType(raw);
  const year = blockYear(raw) || globalYear || null;
  const { subject, topic, subTopic } = classify(
    questionText + " " + options.map((o) => o.text).join(" ")
  );

  const q = {
    id: `upsc_${year || "xx"}_${String(idx).padStart(4, "0")}_${++_seq}`,
    questionText,
    type,
    options,
    correctOption: correctOption || "",
    explanation,
    year,
    subject,
    topic,
    subTopic,
    statements: ["statement", "multi-statement", "assertion"].includes(type)
      ? extractStatements(raw) : [],
    matchPairs: type === "match" ? extractMatchPairs(raw) : [],
    tableData:  type === "table" ? extractTable(raw)      : null,
    images: [],
    tags: [subject, topic].filter(Boolean),
    reviewStatus: "Pending",
    isMalformed: false,
    parseWarnings: [],
  };

  const warnings = validate(q);
  q.parseWarnings = warnings;
  q.isMalformed   = warnings.includes("MISSING_QUESTION_TEXT") ||
                    warnings.includes("INSUFFICIENT_OPTIONS");
  if (!q.isMalformed && !warnings.includes("MISSING_ANSWER")) q.reviewStatus = "Approved";

  return q;
}

// ─────────────────────────────────────────────────────────────────────────────
// ❼  PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

export function parseUPSCDocument(rawText, options = {}) {
  if (!rawText || typeof rawText !== "string") {
    console.error("[upscParser] No text provided.");
    return [];
  }

  const normalized = normalizeText(rawText);
  const globalYear = options.defaultYear || detectYear(normalized);
  const blocks     = splitIntoBlocks(normalized);

  if (!blocks.length) {
    console.warn("[upscParser] No question blocks found. Raw sample:\n",
      normalized.substring(0, 400));
    return [];
  }

  console.log(`[upscParser] ${blocks.length} blocks | year: ${globalYear}`);

  const questions = [];
  for (let i = 0; i < blocks.length; i++) {
    try {
      questions.push(parseBlock(blocks[i], i + 1, globalYear));
    } catch (err) {
      console.error(`[upscParser] Block ${i + 1} error:`, err.message);
    }
  }

  console.log(
    `[upscParser] Done — total: ${questions.length}` +
    ` | approved: ${questions.filter((q) => q.reviewStatus === "Approved").length}` +
    ` | malformed: ${questions.filter((q) => q.isMalformed).length}`
  );
  return questions;
}

export function toDBFormat(questions) {
  return questions
    .filter((q) => !q.isMalformed && q.reviewStatus === "Approved")
    .map(({ parseWarnings, isMalformed, ...rest }) => rest);
}