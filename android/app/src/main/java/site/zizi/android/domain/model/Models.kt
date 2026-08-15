package site.zizi.android.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Domain models for Zizi Android
 * Based on harbor-core/src/types.rs and src/lib/stremio.ts
 */

@Serializable
enum class Resolution {
    @SerialName("4K") UHD,
    @SerialName("1080p") P1080,
    @SerialName("720p") P720,
    @SerialName("480p") P480,
    @SerialName("SD") SD
}

@Serializable
enum class HdrFormat {
    @SerialName("HDR10") Hdr10,
    @SerialName("HDR10+") Hdr10Plus,
    @SerialName("DV") Dv,
    @SerialName("DV+HDR10") DvHdr10,
    @SerialName("HLG") Hlg
}

@Serializable
enum class Codec {
    @SerialName("HEVC") Hevc,
    @SerialName("AVC") Avc,
    @SerialName("AV1") Av1,
    @SerialName("VP9") Vp9,
    @SerialName("MPEG2") Mpeg2,
    @SerialName("Other") Other
}

@Serializable
enum class Source {
    BluRay,
    REMUX,
    @SerialName("WEB-DL") WebDl,
    WEBRip,
    BDRip,
    HDRip,
    DVDRip,
    HDTV,
    CAM,
    TS,
    HDTS,
    TC,
    SCR,
    Other
}

@Serializable
data class Meta(
    val id: String,
    val type: String,
    val name: String? = null,
    val poster: String? = null,
    val background: String? = null,
    val logo: String? = null,
    val description: String? = null,
    val releaseInfo: String? = null,
    val imdbRating: String? = null,
    val genres: List<String>? = null,
    val cast: List<String>? = null,
    val director: List<String>? = null,
    val writer: List<String>? = null,
    val runtime: String? = null,
    val year: Int? = null,
    val videos: List<Video>? = null,
    val trailers: List<Trailer>? = null
)

@Serializable
data class Video(
    val id: String,
    val title: String,
    val season: Int? = null,
    val episode: Int? = null,
    val released: String? = null,
    val thumbnail: String? = null,
    val streams: List<Stream>? = null
)

@Serializable
data class Trailer(
    val source: String,
    val type: String
)

@Serializable
data class Stream(
    val name: String? = null,
    val title: String? = null,
    val description: String? = null,
    val infoHash: String? = null,
    val fileIdx: Long? = null,
    val url: String? = null,
    val ytId: String? = null,
    val externalUrl: String? = null,
    val subtitles: List<Subtitle>? = null,
    val sources: List<String>? = null,
    val behaviorHints: BehaviorHints? = null,
    val addonId: String = "",
    val addonName: String = ""
)

@Serializable
data class Subtitle(
    val id: String? = null,
    val url: String,
    val lang: String? = null
)

@Serializable
data class BehaviorHints(
    val notWebReady: Boolean? = null,
    val bingeGroup: String? = null,
    val countryWhitelist: List<String>? = null,
    val adult: Boolean? = null
)

@Serializable
data class AddonManifest(
    val id: String,
    val name: String,
    val version: String? = null,
    val description: String? = null,
    val logo: String? = null,
    val background: String? = null,
    val contactEmail: String? = null,
    val catalogs: List<Catalog>? = null,
    val resources: List<Resource>? = null,
    val types: List<String>? = null,
    val idPrefixes: List<String>? = null,
    val behaviorHints: AddonBehaviorHints? = null
)

@Serializable
data class AddonBehaviorHints(
    val adult: Boolean? = null,
    val p2p: Boolean? = null,
    val configurable: Boolean? = null,
    val configurationRequired: Boolean? = null
)

@Serializable
data class Catalog(
    val type: String,
    val id: String,
    val name: String? = null,
    val extra: List<Extra>? = null
)

@Serializable
data class Extra(
    val name: String,
    val isRequired: Boolean? = null,
    val options: List<String>? = null
)

@Serializable
sealed class Resource {
    @Serializable
    @SerialName("string")
    data class Simple(val value: String) : Resource()

    @Serializable
    @SerialName("object")
    data class Detailed(
        val name: String,
        val types: List<String>? = null,
        val idPrefixes: List<String>? = null
    ) : Resource()
}

@Serializable
data class LibraryItem(
    val id: String,
    val type: String,
    val name: String,
    val poster: String? = null,
    val background: String? = null,
    val state: LibraryState? = null,
    val removed: Boolean = false,
    val temp: Boolean = false,
    val ctime: String? = null,
    val mtime: String? = null
)

@Serializable
data class LibraryState(
    val timeOffset: Long = 0,
    val duration: Long = 0,
    val season: Int? = null,
    val episode: Int? = null,
    val timeWatched: Long? = null,
    val flaggedWatched: Int? = null,
    val videoId: String? = null,
    val lastWatched: String? = null
)

@Serializable
data class ContinueWatchingItem(
    val id: String,
    val type: String,
    val name: String,
    val poster: String? = null,
    val background: String? = null,
    val progress: Float,
    val timeOffset: Long,
    val duration: Long,
    val season: Int? = null,
    val episode: Int? = null,
    val lastWatched: String? = null
)

@Serializable
data class SearchResult(
    val metas: List<Meta>
)

@Serializable
data class StreamResponse(
    val streams: List<Stream>
)

@Serializable
data class MetaResponse(
    val meta: Meta
)

@Serializable
data class CatalogResponse(
    val metas: List<Meta>,
    val cacheMaxAge: Int? = null,
    val staleRevalidate: Int? = null,
    val staleError: Int? = null
)
