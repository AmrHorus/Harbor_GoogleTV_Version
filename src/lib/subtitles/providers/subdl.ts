import { dinfo, dwarn } from "@/lib/debug";
import { safeFetch } from "@/lib/safe-fetch";
import type { SubResult, SubSearchQuery } from "../types";
import { normalizeLang } from "../language";

const ENDPOINT = "https://api.subdl.com/subtitles";

type RawSub = {
  id: string;
  language: string;
  format: string;
  title?: string;
  release?: string;
  url?: string;
  hearingImpaired?: boolean;
  fps?: number;
  downloads?: number;
};

export async function searchSubDL(q: SubSearchQuery): Promise<SubResult[]> {
  const imdbId = q.imdbId?.startsWith("tt") ? q.imdbId : q.imdbId ? `tt${q.imdbId}` : undefined;

  if (!imdbId && !q.tmdbId && !q.title) {
    dinfo("[subdl] no imdbId, tmdbId or title, skipping");
    return [];
  }

  const params = new URLSearchParams();
  if (imdbId) {
    params.set("imdb_id", imdbId);
  } else if (q.tmdbId) {
    params.set("tmdb_id", q.tmdbId);
  } else if (q.title) {
    params.set("query", q.title);
  }

  if (q.season != null && q.episode != null) {
    params.set("season", String(q.season));
    params.set("episode", String(q.episode));
  }

  if (q.langs && q.langs.length > 0) {
    params.set("languages", q.langs.map((l) => normalizeLang(l)).join(","));
  }

  const url = `${ENDPOINT}?${params.toString()}`;

  try {
    const res = await safeFetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      dwarn(`[subdl] ${url} → ${res.status}`);
      return [];
    }
    const data = await res.json();
    const list: RawSub[] = Array.isArray(data) ? data : [];
    dinfo(`[subdl] ${url} → ${list.length} subs`);

    const out: SubResult[] = [];
    for (const sub of list) {
      if (!sub.url) continue;
      const lang = normalizeLang(sub.language);
      out.push({
        id: `sdl-${sub.id}`,
        url: sub.url,
        lang,
        title: sub.title || sub.release || "SubDL",
        source: "subdl",
        format: (sub.format.toLowerCase() as SubResult["format"]) || undefined,
        fps: sub.fps,
        hearingImpaired: sub.hearingImpaired || false,
        release: sub.release,
        downloads: sub.downloads,
      });
    }
    return out;
  } catch (e) {
    dwarn("[subdl] fetch error", e);
    return [];
  }
}
