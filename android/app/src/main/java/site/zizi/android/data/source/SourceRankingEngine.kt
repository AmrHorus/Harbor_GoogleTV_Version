package site.zizi.android.data.source

import site.zizi.android.domain.model.Stream
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Source ranking engine
 * Ranks available streams based on quality, language, and user preferences
 */
@Singleton
class SourceRankingEngine @Inject constructor() {
    
    /**
     * Rank streams and return sorted list (best first)
     */
    fun rankStreams(
        streams: List<Stream>,
        preferredLanguage: String = "en",
        originalLanguage: String? = null
    ): List<RankedStream> {
        return streams
            .map { stream ->
                RankedStream(
                    stream = stream,
                    score = calculateScore(stream, preferredLanguage, originalLanguage)
                )
            }
            .sortedByDescending { it.score }
    }
    
    /**
     * Get the best eligible stream
     */
    fun getBestStream(
        streams: List<Stream>,
        preferredLanguage: String = "en",
        originalLanguage: String? = null
    ): Stream? {
        return rankStreams(streams, preferredLanguage, originalLanguage)
            .firstOrNull()
            ?.stream
    }
    
    private fun calculateScore(
        stream: Stream,
        preferredLanguage: String,
        originalLanguage: String?
    ): Double {
        var score = 0.0
        
        // Resolution score (0-25 points)
        score += resolutionScore(stream)
        
        // Quality/source score (0-20 points)
        score += sourceQualityScore(stream)
        
        // Language match score (0-20 points)
        score += languageScore(stream, preferredLanguage, originalLanguage)
        
        // Availability score (0-15 points)
        score += availabilityScore(stream)
        
        // HDR/codec bonus (0-10 points)
        score += hdrCodecScore(stream)
        
        // Peer health score if available (0-10 points)
        score += peerScore(stream)
        
        return score
    }
    
    private fun resolutionScore(stream: Stream): Double {
        val title = (stream.title ?: stream.name ?: "").lowercase()
        return when {
            "4k" in title || "2160" in title -> 25.0
            "1080" in title -> 20.0
            "720" in title -> 15.0
            "480" in title -> 10.0
            else -> 5.0
        }
    }
    
    private fun sourceQualityScore(stream: Stream): Double {
        val title = (stream.title ?: stream.name ?: "").lowercase()
        return when {
            "remux" in title -> 20.0
            "bluray" in title || "blu-ray" in title -> 18.0
            "web-dl" in title || "webdl" in title -> 15.0
            "webrip" in title -> 12.0
            "bdrip" in title -> 10.0
            "hdrip" in title -> 8.0
            "dvd" in title -> 5.0
            "cam" in title || "ts" in title -> 2.0
            else -> 10.0
        }
    }
    
    private fun languageScore(
        stream: Stream,
        preferredLanguage: String,
        originalLanguage: String?
    ): Double {
        val title = (stream.title ?: stream.name ?: "").lowercase()
        
        // Prefer original language
        if (originalLanguage != null) {
            if (originalLanguage.lowercase() in title) {
                return 20.0
            }
        }
        
        // Check for preferred language
        return when {
            preferredLanguage.lowercase() in title -> 18.0
            "arabic" in title || "arab" in title -> if (preferredLanguage == "ar") 18.0 else 10.0
            "english" in title || "eng" in title -> if (preferredLanguage == "en") 18.0 else 10.0
            else -> 10.0
        }
    }
    
    private fun availabilityScore(stream: Stream): Double {
        // If we have infoHash, assume it's available via torrent
        return if (stream.infoHash != null) {
            15.0
        } else if (stream.url != null || stream.externalUrl != null) {
            12.0
        } else {
            0.0
        }
    }
    
    private fun hdrCodecScore(stream: Stream): Double {
        val title = (stream.title ?: stream.name ?: "").lowercase()
        var score = 0.0
        
        // HDR bonus
        if ("hdr" in title || "dolby vision" in title || "dv" in title) {
            score += 5.0
        }
        
        // Codec bonus (prefer modern codecs)
        if ("hevc" in title || "h265" in title || "x265" in title) {
            score += 3.0
        } else if ("av1" in title) {
            score += 5.0
        }
        
        return score
    }
    
    private fun peerScore(stream: Stream): Double {
        // Parse seeders from title if available
        val title = (stream.title ?: stream.name ?: "").lowercase()
        
        // Try to extract seeder count from title format like "[👥 123]"
        val seederMatch = Regex("\\[👥\\s*(\\d+)\\]").find(title)
        return seederMatch?.groupValues?.get(1)?.toIntOrNull()?.let { seeds ->
            when {
                seeds >= 1000 -> 10.0
                seeds >= 500 -> 8.0
                seeds >= 100 -> 6.0
                seeds >= 50 -> 4.0
                seeds >= 10 -> 2.0
                else -> 1.0
            }
        } ?: 5.0 // Default score if no seeder info
    }
}

data class RankedStream(
    val stream: Stream,
    val score: Double
)
