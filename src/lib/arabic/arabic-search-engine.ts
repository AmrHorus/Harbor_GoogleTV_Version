/**
 * Advanced Arabic Search Engine
 * 
 * Provides production-grade Arabic search capabilities with:
 * - Natural Arabic language understanding
 * - Multi-field searching (Arabic, English, Original, Alternative titles)
 * - Text normalization for Arabic variations
 * - Fuzzy matching with typo tolerance
 * - Partial search support
 * - Intelligent ranking algorithm
 * - Automatic language fallback
 * - Search caching for performance
 */

import type { Meta } from "@/lib/cinemeta";
import type { SearchResults, SearchIntent } from "@/lib/search";
import {
  normalizeArabicText,
  isArabicQuery,
  arabicMatch,
  arabicSimilarity,
  advancedArabicMatch,
  tokenize,
  createTitleVariants,
} from "@/lib/arabic/search-normalization";

// Cache for search results
interface SearchCacheEntry {
  results: SearchResults;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const SEARCH_CACHE = new Map<string, SearchCacheEntry>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes default TTL

/**
 * Check if cache entry is valid
 */
function isCacheValid(entry: SearchCacheEntry): boolean {
  return Date.now() < entry.timestamp + entry.ttl;
}

/**
 * Get cached search results
 */
function getCachedSearch(normalizedQuery: string): SearchResults | null {
  const entry = SEARCH_CACHE.get(normalizedQuery);
  if (entry && isCacheValid(entry)) {
    return entry.results;
  }
  // Remove expired entry
  if (entry) {
    SEARCH_CACHE.delete(normalizedQuery);
  }
  return null;
}

/**
 * Cache search results
 */
function cacheSearchResults(normalizedQuery: string, results: SearchResults, ttlMs = CACHE_TTL): void {
  SEARCH_CACHE.set(normalizedQuery, {
    results,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
  
  // Clean up old entries periodically (every 100 cache operations)
  if (SEARCH_CACHE.size % 100 === 0) {
    const now = Date.now();
    for (const [key, entry] of SEARCH_CACHE.entries()) {
      if (now >= entry.timestamp + entry.ttl) {
        SEARCH_CACHE.delete(key);
      }
    }
  }
}

/**
 * Extract all searchable titles from a Meta object
 */
function extractSearchableTitles(meta: Meta): {
  arabic?: string;
  english?: string;
  original?: string;
  alternatives: string[];
  allTitles: string[];
} {
  const titles: {
    arabic?: string;
    english?: string;
    original?: string;
    alternatives: string[];
    allTitles: string[];
  } = {
    alternatives: [],
    allTitles: [],
  };
  
  // Try to identify Arabic title
  const name = meta.name || meta.title || "";
  if (isArabicQuery(name)) {
    titles.arabic = name;
  } else {
    titles.english = name;
  }
  
  // Check for original title
  if (meta.originalName && meta.originalName !== name) {
    titles.original = meta.originalName;
  }
  
  // Collect alternative titles
  if (meta.alternativeNames) {
    titles.alternatives = [...meta.alternativeNames];
  }
  
  // Build list of all searchable titles
  if (titles.arabic) titles.allTitles.push(titles.arabic);
  if (titles.english) titles.allTitles.push(titles.english);
  if (titles.original) titles.allTitles.push(titles.original);
  titles.allTitles.push(...titles.alternatives);
  
  return titles;
}

/**
 * Calculate match score for a single meta item against a query
 */
function calculateMatchScore(
  query: string,
  normalizedQuery: string,
  meta: Meta,
  isArabic: boolean
): {
  score: number;
  matchType: 'exact-arabic' | 'exact-english' | 'exact-original' | 'alternative' | 'fuzzy' | 'partial';
  details: any;
} {
  const titles = extractSearchableTitles(meta);
  let bestScore = 0;
  let bestMatchType: any = 'fuzzy';
  let bestDetails: any = {};
  
  // Helper to update best match
  const updateBest = (score: number, matchType: any, details: any) => {
    if (score > bestScore) {
      bestScore = score;
      bestMatchType = matchType;
      bestDetails = details;
    }
  };
  
  // Search through all titles
  for (const title of titles.allTitles) {
    if (!title) continue;
    
    const matchResult = advancedArabicMatch(query, title);
    
    // Determine match type priority
    let matchPriority = 0;
    if (matchResult.details.exactMatch) {
      if (title === titles.arabic) {
        matchPriority = 100; // Exact Arabic match (highest)
      } else if (title === titles.english) {
        matchPriority = 90; // Exact English match
      } else if (title === titles.original) {
        matchPriority = 85; // Exact original match
      } else {
        matchPriority = 70; // Alternative title match
      }
    } else if (matchResult.details.partialMatch) {
      matchPriority = 50;
    } else if (matchResult.details.tokenMatch) {
      matchPriority = 40;
    }
    
    // Weighted score combining match quality and priority
    const weightedScore = matchResult.score * (matchPriority / 100);
    
    if (weightedScore > bestScore) {
      bestScore = weightedScore;
      bestMatchType = matchPriority >= 100 ? 'exact-arabic' :
                      matchPriority >= 90 ? 'exact-english' :
                      matchPriority >= 85 ? 'exact-original' :
                      matchPriority >= 70 ? 'alternative' :
                      matchResult.details.partialMatch ? 'partial' : 'fuzzy';
      bestDetails = matchResult.details;
    }
  }
  
  // Boost score if primary Arabic title matches
  if (titles.arabic && isArabic) {
    const arabicMatchResult = advancedArabicMatch(query, titles.arabic);
    if (arabicMatchResult.matched && arabicMatchResult.score > bestScore) {
      bestScore = arabicMatchResult.score;
      bestMatchType = arabicMatchResult.details.exactMatch ? 'exact-arabic' : 'fuzzy';
      bestDetails = arabicMatchResult.details;
    }
  }
  
  return {
    score: bestScore,
    matchType: bestMatchType,
    details: bestDetails,
  };
}

/**
 * Rank search results using weighted scoring system
 */
function rankResults(
  results: Array<{ meta: Meta; score: number; matchType: string }>,
  query: string
): Array<{ meta: Meta; score: number }> {
  return results
    .filter(r => r.score >= 0.3) // Minimum threshold
    .sort((a, b) => {
      // Primary sort by match score
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      
      // Secondary sort by popularity (if available)
      const popA = (a.meta as any).popularity || 0;
      const popB = (b.meta as any).popularity || 0;
      if (popB !== popA) {
        return popB - popA;
      }
      
      // Tertiary sort by vote average
      const voteA = a.meta.imdbRating || 0;
      const voteB = b.meta.imdbRating || 0;
      return voteB - voteA;
    })
    .map(r => ({ meta: r.meta, score: r.score }));
}

/**
 * Perform fuzzy search on a list of metas
 */
function fuzzySearchMetas(
  query: string,
  metas: Meta[],
  isArabic: boolean,
  limit: number = 20
): Array<{ meta: Meta; score: number }> {
  const normalizedQuery = normalizeArabicText(query);
  
  const scoredResults = metas
    .map(meta => {
      const { score, matchType } = calculateMatchScore(query, normalizedQuery, meta, isArabic);
      return { meta, score, matchType };
    })
    .filter(r => r.score >= 0.3);
  
  return rankResults(scoredResults, query).slice(0, limit);
}

/**
 * Enhanced search with Arabic support
 * This function wraps the existing searchAll function and adds Arabic search capabilities
 */
export async function enhancedSearchWithArabic(
  key: string,
  query: string,
  opts: { excludeGenres?: number[] } = {}
): Promise<SearchResults> {
  const trimmedQuery = query.trim();
  
  if (!trimmedQuery) {
    return {
      query: "",
      topMatch: null,
      people: [],
      movies: [],
      series: [],
      liveTv: [],
      anime: [],
      addonGroups: [],
      addons: [],
      intent: null,
    };
  }
  
  // Detect if query is Arabic
  const isArabic = isArabicQuery(trimmedQuery);
  
  // Normalize query for caching and matching
  const normalizedQuery = normalizeArabicText(trimmedQuery);
  
  // Check cache first
  const cachedResult = getCachedSearch(normalizedQuery);
  if (cachedResult) {
    return cachedResult;
  }
  
  // Import the base search function dynamically to avoid circular dependencies
  const { searchAll: baseSearchAll } = await import("@/lib/search");
  
  // Perform base search
  const baseResults = await baseSearchAll(key, trimmedQuery, opts);
  
  // If query is Arabic or no results found, enhance with Arabic search
  if (isArabic || (baseResults.movies.length === 0 && baseResults.series.length === 0)) {
    // Try to get more results from TMDB with different language parameters
    // or search through existing results with Arabic-aware matching
    
    if (isArabic && baseResults.movies.length > 0) {
      // Re-rank movies using Arabic-aware scoring
      const { movieMeta } = await import("@/lib/providers/tmdb/tmdb-meta-mappers");
      const { get } = await import("@/lib/providers/tmdb/tmdb-client");
      
      try {
        // Fetch additional results with Arabic language preference
        const arabicResults = await get<any>(key, "search/movie", {
          query: trimmedQuery,
          include_adult: "false",
          language: "ar-SA",
        });
        
        if (arabicResults?.results) {
          const arabicMovies = arabicResults.results
            .filter((m: any) => m.poster_path)
            .slice(0, 12)
            .map((m: any) => movieMeta(m));
          
          // Merge with existing results, avoiding duplicates
          const existingIds = new Set(baseResults.movies.map(m => m.id));
          for (const movie of arabicMovies) {
            if (!existingIds.has(movie.id)) {
              baseResults.movies.push(movie);
              existingIds.add(movie.id);
            }
          }
        }
      } catch (e) {
        // Ignore errors, fallback to base results
      }
      
      try {
        // Fetch Arabic TV series
        const { seriesMeta } = await import("@/lib/providers/tmdb/tmdb-meta-mappers");
        const arabicSeries = await get<any>(key, "search/tv", {
          query: trimmedQuery,
          include_adult: "false",
          language: "ar-SA",
        });
        
        if (arabicSeries?.results) {
          const arabicTvShows = arabicSeries.results
            .filter((s: any) => s.poster_path)
            .slice(0, 12)
            .map((s: any) => seriesMeta(s));
          
          // Merge with existing results
          const existingIds = new Set(baseResults.series.map(s => s.id));
          for (const series of arabicTvShows) {
            if (!existingIds.has(series.id)) {
              baseResults.series.push(series);
              existingIds.add(series.id);
            }
          }
        }
      } catch (e) {
        // Ignore errors, fallback to base results
      }
    }
    
    // Re-rank results using Arabic-aware scoring if we have metadata
    if (baseResults.movies.length > 0 || baseResults.series.length > 0) {
      // Apply Arabic-aware re-ranking
      const allMetas = [...baseResults.movies, ...baseResults.series];
      const scored = fuzzySearchMetas(trimmedQuery, allMetas, isArabic, 50);
      
      // Split back into movies and series
      const rankedMovies = scored
        .filter(r => r.meta.type === "movie")
        .slice(0, 12)
        .map(r => r.meta);
      
      const rankedSeries = scored
        .filter(r => r.meta.type === "series")
        .slice(0, 12)
        .map(r => r.meta);
      
      if (rankedMovies.length > 0) {
        baseResults.movies = rankedMovies;
      }
      
      if (rankedSeries.length > 0) {
        baseResults.series = rankedSeries;
      }
      
      // Update top match if we have better Arabic matches
      if (scored.length > 0 && scored[0].score > 0.5) {
        const topScored = scored[0];
        const isMovie = topScored.meta.type === "movie";
        
        // Only replace top match if Arabic match is strong
        if (isArabic || !baseResults.topMatch) {
          baseResults.topMatch = {
            kind: isMovie ? "movie" : "series",
            meta: topScored.meta,
            popularity: (topScored.meta as any).popularity || 0,
            backdrop: topScored.meta.background || undefined,
            overview: topScored.meta.description || topScored.meta.overview,
            voteAverage: topScored.meta.imdbRating || 0,
          };
        }
      }
    }
  }
  
  // Cache the results
  cacheSearchResults(normalizedQuery, baseResults);
  
  return baseResults;
}

/**
 * Get search suggestions with Arabic support
 */
export async function getArabicSearchSuggestions(
  key: string,
  query: string,
  limit: number = 5
): Promise<Array<{
  id: string;
  title: string;
  year: string;
  type: "movie" | "series";
  poster: string | null;
  score: number;
}>> {
  const trimmedQuery = query.trim();
  
  if (trimmedQuery.length < 2) {
    return [];
  }
  
  const isArabic = isArabicQuery(trimmedQuery);
  const normalizedQuery = normalizeArabicText(trimmedQuery);
  
  // Check cache
  const cachedKey = `suggestions:${normalizedQuery}`;
  const cached = getCachedSearch(cachedKey) as any;
  if (cached) {
    return cached;
  }
  
  try {
    const { searchAll } = await import("@/lib/search");
    const results = await searchAll(key, trimmedQuery);
    
    const suggestions: Array<{
      id: string;
      title: string;
      year: string;
      type: "movie" | "series";
      poster: string | null;
      score: number;
    }> = [];
    
    // Process movies
    for (const movie of results.movies.slice(0, limit)) {
      const matchScore = isArabic 
        ? advancedArabicMatch(trimmedQuery, movie.name || "").score
        : 1.0;
      
      if (matchScore >= 0.3) {
        suggestions.push({
          id: movie.id,
          title: movie.name || movie.title || "",
          year: movie.year || "",
          type: "movie",
          poster: movie.poster || null,
          score: matchScore,
        });
      }
    }
    
    // Process series
    for (const series of results.series.slice(0, limit - suggestions.length)) {
      const matchScore = isArabic
        ? advancedArabicMatch(trimmedQuery, series.name || "").score
        : 1.0;
      
      if (matchScore >= 0.3 && suggestions.length < limit) {
        suggestions.push({
          id: series.id,
          title: series.name || "",
          year: series.year || "",
          type: "series",
          poster: series.poster || null,
          score: matchScore,
        });
      }
    }
    
    // Sort by score and limit
    suggestions.sort((a, b) => b.score - a.score);
    const finalSuggestions = suggestions.slice(0, limit);
    
    // Cache suggestions with shorter TTL
    cacheSearchResults(cachedKey, { ...results, query: trimmedQuery }, 5 * 60 * 1000);
    
    return finalSuggestions;
  } catch (error) {
    console.error("Error getting Arabic search suggestions:", error);
    return [];
  }
}

/**
 * Clear search cache
 */
export function clearSearchCache(): void {
  SEARCH_CACHE.clear();
}

/**
 * Get cache statistics
 */
export function getSearchCacheStats(): {
  size: number;
  entries: number;
} {
  const now = Date.now();
  let validEntries = 0;
  
  for (const entry of SEARCH_CACHE.values()) {
    if (now < entry.timestamp + entry.ttl) {
      validEntries++;
    }
  }
  
  return {
    size: SEARCH_CACHE.size,
    entries: validEntries,
  };
}
