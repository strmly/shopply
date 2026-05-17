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
 * Returns 'exact' | 'stem' | 'fuzzy' | null.
 * allowFuzzy should only be true for trusted fields (name, subcategory, brand).
 * Fuzzy requires term ≥ 5 chars to avoid "soft"↔"sofa" type false positives.
 */
export function matchTerm(text, term, allowFuzzy = false) {
  const stemmed = stem(term);
  if (text.includes(term)) return 'exact';
  if (stemmed !== term && text.includes(stemmed)) return 'stem';
  if (allowFuzzy && term.length >= 5) {
    const words = text.split(/\W+/).filter(w => w.length >= 5);
    for (const w of words) {
      if (editDistance(w, term) === 1 || (stemmed !== term && editDistance(w, stemmed) === 1)) return 'fuzzy';
    }
  }
  return null;
}

/**
 * Score a product against a multi-word query.
 * Returns 0 if not all terms match a primary field — filters out unrelated products.
 *
 * Description is excluded: it's too noisy and causes unrelated products to appear
 * (e.g. a dresser description saying "pairs well with your sofa" matching a sofa search).
 * Fuzzy matching is restricted to name/subcategory/brand to prevent field noise.
 */
export function scoreProductText(product, rawQuery) {
  if (!rawQuery?.trim()) return 1;

  const terms = rawQuery.toLowerCase().split(/\s+/).filter(t => t.length > 1 && !STOP_WORDS.has(t));
  if (terms.length === 0) return 1;

  const fields = [
    { text: (product.name || '').toLowerCase(),                                    weight: 10, fuzzy: true },
    { text: (product.normalizedTitle || product.name || '').toLowerCase(),         weight: 8,  fuzzy: true },
    { text: (product.subcategory || product.furnitureCategory || '').toLowerCase(), weight: 6,  fuzzy: true },
    { text: (product.category || '').toLowerCase(),                                weight: 5,  fuzzy: false },
    { text: ((product.tags || []).join(' ')).toLowerCase(),                         weight: 4,  fuzzy: false },
  ];

  let totalScore = 0;
  let matchedTerms = 0;

  for (const term of terms) {
    let termBestScore = 0;
    for (const { text, weight, fuzzy } of fields) {
      const matchType = matchTerm(text, term, fuzzy);
      if (!matchType) continue;
      const multiplier = matchType === 'exact' ? 1.0 : matchType === 'stem' ? 0.85 : 0.55;
      termBestScore = Math.max(termBestScore, weight * multiplier);
    }
    if (termBestScore > 0) matchedTerms++;
    totalScore += termBestScore;
  }

  if (matchedTerms < terms.length) return 0;
  return totalScore;
}
