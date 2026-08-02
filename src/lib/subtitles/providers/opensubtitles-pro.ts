import { dinfo, dwarn } from "@/lib/debug";
import { safeFetch } from "@/lib/safe-fetch";
import type { SubResult, SubSearchQuery } from "../types";
import { normalizeLang } from "../language";

const ENDPOINT = "https://api.opensubtitles.com/api/v1/subtitles";
const API_KEY_HEADER = "Api-Key";

type RawSub = {
  id: string;
  attributes: {
    files: Array<{
      file_id: number;
      file_name: string;
      language: string;
      format: string;
      fps?: number;
      hearing_impaired?: boolean;
      hd?: boolean;
    }>;
    release: string;
    feature_details?: {
      tmdb_id?: number;
      imdb_id?: string;
    };
  };
};

async function searchOpenSubtitlesPro(
  q: SubSearchQuery,
  apiKey?: string,
): Promise<SubResult[]> {
  const imdbId = q.imdbId?.startsWith("tt") ? q.imdbId : q.imdbId ? `tt${q.imdbId}` : undefined;
  
  if (!imdbId && !q.tmdbId) {
    dinfo("[opensubtitles-pro] no imdbId or tmdbId, skipping");
    return [];
  }

  const params = new URLSearchParams();
  if (imdbId) {
    params.set("movie_imdb_id", imdbId);
  } else if (q.tmdbId) {
    params.set("tmdb_id", q.tmdbId);
  }

  if (q.season != null && q.episode != null) {
    params.set("season_number", String(q.season));
    params.set("episode_number", String(q.episode));
  }

  if (q.langs && q.langs.length > 0) {
    params.set("languages", q.langs.map((l) => normalizeLang(l)).join(","));
  }

  const url = `${ENDPOINT}?${params.toString()}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "Harbor/1.0",
  };

  if (apiKey) {
    headers[API_KEY_HEADER] = apiKey;
  }

  try {
    const res = await safeFetch(url, { headers });
    if (!res.ok) {
      dwarn(`[opensubtitles-pro] ${url} → ${res.status}`);
      return [];
    }
    const data = await res.json();
    const list: RawSub[] = Array.isArray(data?.data) ? data.data : [];
    dinfo(`[opensubtitles-pro] ${url} → ${list.length} subs`);

    const out: SubResult[] = [];
    for (const sub of list) {
      for (const file of sub.attributes.files) {
        if (!file.file_id) continue;
        const downloadUrl = `${ENDPOINT}/download?file_id=${file.file_id}`;
        const lang = normalizeLang(file.language);
        out.push({
          id: `osp-${sub.id}-${file.file_id}`,
          url: downloadUrl,
          lang,
          title: sub.attributes.release || file.file_name,
          source: "opensubtitles-pro",
          format: (file.format.toLowerCase() as SubResult["format"]) || undefined,
          fps: file.fps,
          hearingImpaired: file.hearing_impaired || false,
          release: sub.attributes.release,
        });
      }
    }
    return out;
  } catch (e) {
    dwarn("[opensubtitles-pro] fetch error", e);
    return [];
  }
}

export async function searchOpenSubtitlesPro(q: SubSearchQuery): Promise<SubResult[]> {
  // Try without API key first (free tier)
  const results = await searchOpenSubtitlesPro(q, undefined);
  return results;
}
