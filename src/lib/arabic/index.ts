import {
  ARABIC_COMEDY,
  ARABIC_DRAMA,
  ARABIC_KHALEEJI,
  ARABIC_MOVIES,
  ARABIC_RAMADAN,
  ARABIC_TRENDING,
  type ArabicRowDef,
} from "./rows";
import { ARABIC_CLASSICS, EGYPTIAN_CLASSICS, fetchEgyptianClassics } from "./classics";
import {
  normalizeArabicText,
  containsArabic,
  isArabicQuery,
  arabicMatch,
  arabicSimilarity,
  tokenize,
  advancedArabicMatch,
  createTitleVariants,
} from "./search-normalization";

export type { ArabicRowDef } from "./rows";
export { EGYPTIAN_CLASSICS, fetchEgyptianClassics } from "./classics";
export {
  normalizeArabicText,
  containsArabic,
  isArabicQuery,
  arabicMatch,
  arabicSimilarity,
  tokenize,
  advancedArabicMatch,
  createTitleVariants,
} from "./search-normalization";

export const ARABIC_ROWS: ArabicRowDef[] = [
  ARABIC_RAMADAN,
  ARABIC_DRAMA,
  ARABIC_MOVIES,
  ARABIC_CLASSICS,
  ARABIC_KHALEEJI,
  ARABIC_COMEDY,
  ARABIC_TRENDING,
];
