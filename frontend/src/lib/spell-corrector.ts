/**
 * Sarath Search Engine v19.0 — Spell Corrector & Fuzzy Matching Engine
 */

export interface SpellCorrectionResult {
  originalQuery: string;
  correctedQuery: string;
  isCorrected: boolean;
  didYouMean: string | null;
}

const COMMON_DICTIONARY: Record<string, string> = {
  instagarm: 'Instagram',
  instgram: 'Instagram',
  instagramm: 'Instagram',
  gogle: 'Google',
  googl: 'Google',
  goggl: 'Google',
  yotube: 'YouTube',
  youtub: 'YouTube',
  utube: 'YouTube',
  facbook: 'Facebook',
  facebok: 'Facebook',
  amazn: 'Amazon',
  amzon: 'Amazon',
  wikipdia: 'Wikipedia',
  wikipidia: 'Wikipedia',
  pythn: 'Python',
  pyton: 'Python',
  reactjs: 'React',
  supabs: 'Supabase',
  supabse: 'Supabase',
  linkdin: 'LinkedIn',
  twiter: 'Twitter',
  twtter: 'Twitter',
  chatgpt: 'ChatGPT',
  opnai: 'OpenAI',
  gthub: 'GitHub',
  githb: 'GitHub',
};

/**
 * Calculates Levenshtein Distance between two string tokens
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Normalizes query, checks dictionary, and applies fuzzy matching
 */
export function correctQuerySpelling(rawQuery: string): SpellCorrectionResult {
  const cleanQuery = rawQuery.trim();
  if (!cleanQuery) {
    return { originalQuery: '', correctedQuery: '', isCorrected: false, didYouMean: null };
  }

  const lowerQuery = cleanQuery.toLowerCase();

  // 1. Direct Dictionary Lookup
  if (COMMON_DICTIONARY[lowerQuery]) {
    const corrected = COMMON_DICTIONARY[lowerQuery];
    return {
      originalQuery: cleanQuery,
      correctedQuery: corrected,
      isCorrected: true,
      didYouMean: corrected,
    };
  }

  // 2. Fuzzy Levenshtein Distance Matcher
  let bestMatch: string | null = null;
  let minDistance = 3; // Maximum allowed distance for typos

  for (const [typo, fix] of Object.entries(COMMON_DICTIONARY)) {
    const dist = calculateLevenshteinDistance(lowerQuery, typo);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = fix;
    }
  }

  if (bestMatch && minDistance <= 2) {
    return {
      originalQuery: cleanQuery,
      correctedQuery: bestMatch,
      isCorrected: true,
      didYouMean: bestMatch,
    };
  }

  return {
    originalQuery: cleanQuery,
    correctedQuery: cleanQuery,
    isCorrected: false,
    didYouMean: null,
  };
}
