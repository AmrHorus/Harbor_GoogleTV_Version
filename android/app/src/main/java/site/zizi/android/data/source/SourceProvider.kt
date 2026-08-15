package site.zizi.android.data.source

import site.zizi.android.domain.model.Stream

/**
 * Interface for content source providers
 * Each provider implements this interface to supply playable streams
 */
interface SourceProvider {
    
    /**
     * Provider identifier
     */
    val id: String
    
    /**
     * Provider display name
     */
    val name: String
    
    /**
     * Whether this provider is currently available/authorized
     */
    suspend fun isAvailable(): Boolean
    
    /**
     * Search for streams for a movie
     * @param imdbId IMDb identifier (e.g., "tt1234567")
     * @param title Movie title
     * @param year Release year
     */
    suspend fun searchMovie(
        imdbId: String?,
        title: String,
        year: Int?
    ): List<Stream>
    
    /**
     * Search for streams for a TV episode
     * @param imdbId IMDb identifier
     * @param title Series title
     * @param season Season number
     * @param episode Episode number
     */
    suspend fun searchEpisode(
        imdbId: String?,
        title: String,
        season: Int,
        episode: Int
    ): List<Stream>
}
