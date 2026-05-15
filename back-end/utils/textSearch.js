// back-end/utils/textSearch.js

const STOP_WORDS = new Set(['and','the','a','an','in','of','for','to','with','on','at','by','from','room','style']);

function stem(word) {
  if (word.length < 4) return word;
  if (word.endsWith('ies') && word.length > 5) return word.slice(0, -3) + 'y';
  if (word.endsWith('ves') && word.length > 5) return word.slice(0, -3) + 'f';
  if (word.endsWith('ses') || word.endsWith('xes') || word.endsWith('zes')) return word.slice(0, -2);
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && word.length > 3 && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let cur = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = cur;
      cur = a[i-1] === b[j-1] ? prev[j-1] : 1 + Math.min(prev[j-1], prev[j], cur);
      prev[j-1] = temp;
    }
    prev[b.length] = cur;
  }
  return prev[b.length];
}

/**
 * Standard DP Levenshtein (no early-exit optimisation) — used for the
 * typo-tolerant fuzzy fallback so we can check distance ≤ 2 reliably.
 */
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  // Allocate a (m+1) × (n+1) matrix
  const dp = Array.from({ length: m + 1 }, (_, i) => {
    const row = new Array(n + 1);
    row[0] = i;
    return row;
  });
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Returns 'exact' | 'stem' | 'fuzzy' | null
 * Checks if `term` appears in `text` (already lowercase).
 *
 * Match priority:
 *  1. Exact substring match
 *  2. Stemmed substring match
 *  3. Single-edit-distance fuzzy (existing behaviour)
 *  4. Typo-tolerant fallback: Levenshtein ≤ min(2, floor(len/3)) for words >= 4 chars
 */
export function matchTerm(text, term) {
  const stemmed = stem(term);
  if (text.includes(term)) return 'exact';
  if (stemmed !== term && text.includes(stemmed)) return 'stem';
  if (term.length >= 4) {
    const words = text.split(/\W+/).filter(w => w.length >= 4);
    // Pass 1: edit distance of exactly 1 (original behaviour)
    for (const w of words) {
      if (editDistance(w, term) === 1 || (stemmed !== term && editDistance(w, stemmed) === 1)) return 'fuzzy';
    }
    // Pass 2: typo-tolerant — allow up to min(2, floor(termLen/3)) edits
    const maxDist = Math.min(2, Math.floor(term.length / 3));
    if (maxDist >= 2) {
      for (const w of words) {
        if (levenshtein(w, term) <= maxDist) return 'fuzzy';
        if (stemmed !== term && levenshtein(w, stemmed) <= maxDist) return 'fuzzy';
      }
    }
  }
  return null;
}

/**
 * Score a product against a multi-word query.
 * Returns 0 if no terms match, >0 otherwise (higher = better match).
 * Checks name (weight 10), category (weight 6), tags (weight 4), description (weight 2).
 */
export function scoreProductText(product, rawQuery) {
  if (!rawQuery?.trim()) return 1; // empty query matches everything

  const terms = rawQuery.toLowerCase().split(/\s+/).filter(t => t.length > 1 && !STOP_WORDS.has(t));
  if (terms.length === 0) return 1;

  const fields = [
    { text: (product.name || '').toLowerCase(), weight: 10 },
    { text: (product.normalizedTitle || product.name || '').toLowerCase(), weight: 8 },
    { text: (product.category || '').toLowerCase(), weight: 6 },
    { text: ((product.tags || []).join(' ')).toLowerCase(), weight: 4 },
    { text: (product.description || '').toLowerCase(), weight: 2 },
  ];

  let totalScore = 0;
  let matchedTerms = 0;

  for (const term of terms) {
    let termBestScore = 0;
    for (const { text, weight } of fields) {
      const matchType = matchTerm(text, term);
      if (!matchType) continue;
      const multiplier = matchType === 'exact' ? 1.0 : matchType === 'stem' ? 0.85 : 0.55;
      termBestScore = Math.max(termBestScore, weight * multiplier);
    }
    if (termBestScore > 0) matchedTerms++;
    totalScore += termBestScore;
  }

  // Require ALL terms to match for multi-word queries
  if (matchedTerms < terms.length) return 0;
  return totalScore;
}
