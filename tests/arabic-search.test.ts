/**
 * Test suite for Arabic Search Normalization
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  normalizeArabicText,
  containsArabic,
  isArabicQuery,
  arabicMatch,
  arabicSimilarity,
  tokenize,
  advancedArabicMatch,
  createTitleVariants,
} from '../src/lib/arabic/search-normalization';

describe('Arabic Search Normalization', () => {
  describe('normalizeArabicText', () => {
    it('should normalize Alef variations', () => {
      assert.strictEqual(normalizeArabicText('أ'), 'ا');
      assert.strictEqual(normalizeArabicText('إ'), 'ا');
      assert.strictEqual(normalizeArabicText('آ'), 'ا');
      assert.strictEqual(normalizeArabicText('ٱ'), 'ا');
    });

    it('should normalize Yeh variations', () => {
      assert.strictEqual(normalizeArabicText('ى'), 'ي');
      assert.strictEqual(normalizeArabicText('ئ'), 'ي');
    });

    it('should normalize Waw variations', () => {
      assert.strictEqual(normalizeArabicText('ؤ'), 'و');
    });

    it('should normalize Teh Marbuta', () => {
      assert.strictEqual(normalizeArabicText('ة'), 'ه');
    });

    it('should remove tashkeel (diacritics)', () => {
      const withTashkeel = 'الْفِيلُ الْأَزْرَقُ';
      const normalized = normalizeArabicText(withTashkeel);
      assert.strictEqual(normalized, 'الفيل الازرق');
    });

    it('should remove tatweel (elongation)', () => {
      const withTatweel = 'فــــيــــل';
      const normalized = normalizeArabicText(withTatweel);
      assert.ok(!normalized.includes('ـ'));
    });

    it('should normalize whitespace', () => {
      const messy = 'الفيل    الأزرق';
      const normalized = normalizeArabicText(messy);
      assert.strictEqual(normalized, 'الفيل الازرق');
    });

    it('should handle complete movie title normalization', () => {
      const variants = [
        'الفيل الأزرق',
        'الفيل الازرق',
        'الفيل-الازرق',
        'الفيل، الأزرق',
        'الفيل    الأزرق',
      ];
      
      const normalized = variants.map(v => normalizeArabicText(v));
      const allSame = normalized.every(n => n === normalized[0]);
      
      assert.ok(allSame, 'All variants should normalize to the same string');
      assert.strictEqual(normalized[0], 'الفيل الازرق');
    });
  });

  describe('containsArabic', () => {
    it('should detect Arabic text', () => {
      assert.ok(containsArabic('الفيل الأزرق'));
      assert.ok(containsArabic('مرحبا'));
    });

    it('should return false for non-Arabic text', () => {
      assert.ok(!containsArabic('The Blue Elephant'));
      assert.ok(!containsArabic('12345'));
    });
  });

  describe('isArabicQuery', () => {
    it('should identify primarily Arabic queries', () => {
      assert.ok(isArabicQuery('الفيل الأزرق'));
      assert.ok(isArabicQuery('ولاد رزق'));
    });

    it('should return false for English queries', () => {
      assert.ok(!isArabicQuery('The Blue Elephant'));
      assert.ok(!isArabicQuery('Blue Elephant'));
    });
  });

  describe('arabicMatch', () => {
    it('should match exact normalized strings', () => {
      assert.ok(arabicMatch('الفيل الأزرق', 'الفيل الأزرق'));
      assert.ok(arabicMatch('الفيل الازرق', 'الفيل الأزرق'));
    });

    it('should match with Alef variations', () => {
      assert.ok(arabicMatch('أزرق', 'ازرق'));
      assert.ok(arabicMatch('إزرق', 'ازرق'));
      assert.ok(arabicMatch('آزرق', 'ازرق'));
    });

    it('should match with Teh Marbuta', () => {
      assert.ok(arabicMatch('فاطمة', 'فاطمه'));
    });

    it('should handle partial matches', () => {
      assert.ok(arabicMatch('فيل', 'الفيل الأزرق'));
      assert.ok(arabicMatch('رزق', 'ولاد رزق'));
    });
  });

  describe('arabicSimilarity', () => {
    it('should return 1.0 for exact matches', () => {
      assert.strictEqual(arabicSimilarity('الفيل', 'الفيل'), 1.0);
    });

    it('should return high score for similar strings', () => {
      const score = arabicSimilarity('ولاد رزق', 'اولاد رزق');
      assert.ok(score > 0.8, `Expected high similarity, got ${score}`);
    });

    it('should return low score for different strings', () => {
      const score = arabicSimilarity('فيلم', 'مسلسل');
      assert.ok(score < 0.5, `Expected low similarity, got ${score}`);
    });
  });

  describe('tokenize', () => {
    it('should split text into tokens', () => {
      const tokens = tokenize('الفيل الأزرق');
      assert.deepStrictEqual(tokens, ['الفيل', 'الازرق']);
    });

    it('should handle multiple spaces', () => {
      const tokens = tokenize('ولاد    رزق');
      assert.deepStrictEqual(tokens, ['ولاد', 'رزق']);
    });
  });

  describe('advancedArabicMatch', () => {
    it('should detect exact match', () => {
      const result = advancedArabicMatch('الفيل الأزرق', 'الفيل الأزرق');
      assert.ok(result.matched);
      assert.ok(result.details.exactMatch);
      assert.strictEqual(result.score, 1.0);
    });

    it('should detect fuzzy match', () => {
      const result = advancedArabicMatch('ولاد رزق', 'اولاد رزق');
      assert.ok(result.matched);
      assert.ok(result.score > 0.4);
    });

    it('should handle typos', () => {
      const result = advancedArabicMatch('ولاد رزك', 'ولاد رزق');
      assert.ok(result.matched || result.score > 0.3);
    });
  });

  describe('createTitleVariants', () => {
    it('should generate title variants', () => {
      const variants = createTitleVariants('الفيل الأزرق');
      
      assert.strictEqual(variants.original, 'الفيل الأزرق');
      assert.ok(variants.normalized.length > 0);
      assert.ok(variants.tokens.length > 0);
      assert.ok(variants.prefixes.length > 0);
    });

    it('should generate prefixes for partial matching', () => {
      const variants = createTitleVariants('باب الحارة');
      
      assert.ok(variants.prefixes.some(p => p === 'باب'));
      assert.ok(variants.prefixes.some(p => p === 'باب الحارة'));
    });
  });

  describe('Real-world examples', () => {
    it('should handle "الفيل الأزرق" variants', () => {
      const query = 'الفيل الازرق';
      const target = 'الفيل الأزرق';
      
      assert.ok(arabicMatch(query, target));
      const similarity = arabicSimilarity(query, target);
      assert.ok(similarity > 0.9);
    });

    it('should handle "ولاد رزق" variants', () => {
      const variants = [
        'ولاد رزق',
        'اولاد رزق',
        'ولد رزق',
      ];
      
      const normalized = variants.map(v => normalizeArabicText(v));
      // All should be similar enough to match
      for (let i = 1; i < normalized.length; i++) {
        const similarity = arabicSimilarity(normalized[0], normalized[i]);
        assert.ok(similarity > 0.6, `Variant ${i} should be similar`);
      }
    });

    it('should handle "الهيبة" variants', () => {
      const variants = [
        'هيبه',
        'الهيبه',
        'الهيبة',
      ];
      
      const normalized = variants.map(v => normalizeArabicText(v));
      assert.ok(normalized.every(n => n.includes('هيب')));
    });
  });
});

console.log('Arabic Search Normalization tests loaded successfully');
