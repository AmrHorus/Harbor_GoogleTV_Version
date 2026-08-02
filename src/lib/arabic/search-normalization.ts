/**
 * Arabic Text Normalization Utilities
 * 
 * Normalizes Arabic text for consistent searching by handling:
 * - Alef variations (أ, إ, آ, ٱ → ا)
 * - Yeh variations (ى, ئ → ي)
 * - Waw variations (ؤ → و)
 * - Teh Marbuta (ة → ه)
 * - Tashkeel (diacritics removal)
 * - Tatweel (elongation removal)
 * - Whitespace normalization
 * - Punctuation removal
 */

// Arabic character ranges
const ALEF_VARIATIONS = ['أ', 'إ', 'آ', 'ٱ', 'ا'];
const YEH_VARIATIONS = ['ى', 'ئ', 'ي'];
const WAW_VARIATIONS = ['ؤ', 'و'];
const TEH_MARBUTA = 'ة';
const HEH = 'ه';

// Tashkeel (diacritics) range: U+064B to U+065F
const TASHKEEL_RANGE = /[\u064B-\u065F]/g;

// Tatweel (elongation): U+0640
const TATWEEL = /\u0640/g;

// Arabic punctuation and common separators
const ARABIC_PUNCTUATION = /[،؛؟ـ\-_()（）«»""''\.\/\\|&*+%#=]+/g;

// Multiple whitespace
const MULTIPLE_WHITESPACE = /\s+/g;

/**
 * Normalize a single Arabic character
 */
function normalizeArabicChar(char: string): string {
  if (ALEF_VARIATIONS.includes(char)) return 'ا';
  if (YEH_VARIATIONS.includes(char)) return 'ي';
  if (WAW_VARIATIONS.includes(char)) return 'و';
  if (char === TEH_MARBUTA) return 'ه';
  return char;
}

/**
 * Normalize Arabic text for searching
 * 
 * This function:
 * 1. Normalizes Alef, Yeh, Waw, and Teh Marbuta variations
 * 2. Removes tashkeel (diacritics)
 * 3. Removes tatweel (elongation)
 * 4. Removes punctuation
 * 5. Normalizes whitespace
 * 6. Converts to lowercase for consistency
 */
export function normalizeArabicText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    // Normalize individual characters
    .split('')
    .map(normalizeArabicChar)
    .join('')
    // Remove tashkeel (diacritics)
    .replace(TASHKEEL_RANGE, '')
    // Remove tatweel (elongation)
    .replace(TATWEEL, '')
    // Remove punctuation and separators
    .replace(ARABIC_PUNCTUATION, ' ')
    // Normalize whitespace
    .replace(MULTIPLE_WHITESPACE, ' ')
    // Trim and lowercase
    .trim()
    .toLowerCase();
}

/**
 * Check if text contains Arabic characters
 */
export function containsArabic(text: string): boolean {
  const arabicRange = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRange.test(text);
}

/**
 * Detect if query is primarily Arabic
 */
export function isArabicQuery(query: string): boolean {
  const arabicChars = query.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g);
  if (!arabicChars) return false;
  
  // Consider it Arabic if more than 30% of characters are Arabic
  const arabicRatio = arabicChars.length / query.length;
  return arabicRatio > 0.3;
}

/**
 * Normalize both query and target for comparison
 * Returns true if they match after normalization
 */
export function arabicMatch(query: string, target: string): boolean {
  const normalizedQuery = normalizeArabicText(query);
  const normalizedTarget = normalizeArabicText(target);
  
  if (!normalizedQuery || !normalizedTarget) return false;
  
  // Exact match after normalization
  if (normalizedQuery === normalizedTarget) return true;
  
  // Query is contained in target
  if (normalizedTarget.includes(normalizedQuery)) return true;
  
  // Target is contained in query
  if (normalizedQuery.includes(normalizedTarget)) return true;
  
  return false;
}

/**
 * Calculate similarity score between two Arabic strings
 * Uses a combination of normalization and Levenshtein distance
 */
export function arabicSimilarity(query: string, target: string): number {
  const normalizedQuery = normalizeArabicText(query);
  const normalizedTarget = normalizeArabicText(target);
  
  if (!normalizedQuery || !normalizedTarget) return 0;
  
  // Exact match after normalization
  if (normalizedQuery === normalizedTarget) return 1.0;
  
  // One contains the other
  if (normalizedTarget.includes(normalizedQuery) || normalizedQuery.includes(normalizedTarget)) {
    const shorter = Math.min(normalizedQuery.length, normalizedTarget.length);
    const longer = Math.max(normalizedQuery.length, normalizedTarget.length);
    return shorter / longer;
  }
  
  // Calculate Levenshtein distance
  const distance = levenshteinDistance(normalizedQuery, normalizedTarget);
  const maxLength = Math.max(normalizedQuery.length, normalizedTarget.length);
  
  if (maxLength === 0) return 0;
  
  // Convert distance to similarity score (0-1)
  return 1 - (distance / maxLength);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  
  if (m === 0) return n;
  if (n === 0) return m;
  
  // Create matrix
  const matrix = Array.from({ length: m + 1 }, (_, i) => 
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  
  // Fill matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
      
      // Damerau-Levenshtein: transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost);
      }
    }
  }
  
  return matrix[m][n];
}

/**
 * Tokenize text into words for better matching
 */
export function tokenize(text: string): string[] {
  return normalizeArabicText(text)
    .split(/\s+/)
    .filter(token => token.length > 0);
}

/**
 * Advanced Arabic matching with token-based scoring
 * Returns a score indicating how well the query matches the target
 */
export function advancedArabicMatch(query: string, target: string): {
  score: number;
  matched: boolean;
  details: {
    exactMatch: boolean;
    tokenMatch: boolean;
    partialMatch: boolean;
    fuzzyScore: number;
  };
} {
  const normalizedQuery = normalizeArabicText(query);
  const normalizedTarget = normalizeArabicText(target);
  
  const queryTokens = tokenize(query);
  const targetTokens = tokenize(target);
  
  let score = 0;
  const details = {
    exactMatch: false,
    tokenMatch: false,
    partialMatch: false,
    fuzzyScore: 0,
  };
  
  // Exact match after normalization (highest priority)
  if (normalizedQuery === normalizedTarget) {
    details.exactMatch = true;
    return { score: 1.0, matched: true, details };
  }
  
  // Check if query is contained in target or vice versa
  if (normalizedTarget.includes(normalizedQuery) || normalizedQuery.includes(normalizedTarget)) {
    details.partialMatch = true;
    const shorter = Math.min(normalizedQuery.length, normalizedTarget.length);
    const longer = Math.max(normalizedQuery.length, normalizedTarget.length);
    score = Math.max(score, shorter / longer);
  }
  
  // Token-based matching
  let matchedTokens = 0;
  for (const qToken of queryTokens) {
    for (const tToken of targetTokens) {
      if (tToken.includes(qToken) || qToken.includes(tToken)) {
        matchedTokens++;
        break;
      }
    }
  }
  
  if (matchedTokens > 0) {
    details.tokenMatch = true;
    const tokenScore = matchedTokens / Math.max(queryTokens.length, targetTokens.length);
    score = Math.max(score, tokenScore);
  }
  
  // Fuzzy matching
  const fuzzyScore = arabicSimilarity(query, target);
  details.fuzzyScore = fuzzyScore;
  score = Math.max(score, fuzzyScore);
  
  // Consider it a match if score is above threshold
  const matched = score >= 0.4;
  
  return { score, matched, details };
}

/**
 * Normalize a title for storage and indexing
 * Creates multiple normalized variants for better search coverage
 */
export function createTitleVariants(title: string): {
  original: string;
  normalized: string;
  tokens: string[];
  prefixes: string[];
} {
  const normalized = normalizeArabicText(title);
  const tokens = tokenize(title);
  
  // Generate prefix variants for partial matching
  const prefixes: string[] = [];
  let accumulated = '';
  for (const token of tokens) {
    accumulated += (accumulated ? ' ' : '') + token;
    prefixes.push(accumulated);
    
    // Also add first 3 characters of each token if token is long enough
    if (token.length >= 3) {
      prefixes.push(token.substring(0, 3));
    }
  }
  
  return {
    original: title,
    normalized,
    tokens,
    prefixes: [...new Set(prefixes)], // Remove duplicates
  };
}
