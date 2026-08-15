package site.zizi.android.data.subtitle

import site.zizi.android.domain.model.Subtitle

/**
 * Interface for subtitle providers
 */
interface SubtitleProvider {
    
    val id: String
    val name: String
    
    suspend fun isAvailable(): Boolean
    
    /**
     * Search subtitles for a movie
     */
    suspend fun searchMovie(
        imdbId: String?,
        tmdbId: String?,
        title: String,
        year: Int?,
        language: String? = null
    ): List<Subtitle>
    
    /**
     * Search subtitles for a TV episode
     */
    suspend fun searchEpisode(
        imdbId: String?,
        tmdbId: String?,
        seriesTitle: String,
        season: Int,
        episode: Int,
        language: String? = null
    ): List<Subtitle>
}
