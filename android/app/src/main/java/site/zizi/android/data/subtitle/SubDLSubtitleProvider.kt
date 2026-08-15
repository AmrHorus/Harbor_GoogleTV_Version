package site.zizi.android.data.subtitle

import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query
import site.zizi.android.domain.model.Subtitle
import javax.inject.Inject
import javax.inject.Singleton

/**
 * SubDL subtitle provider implementation
 * https://subdl.com/
 */
@Singleton
class SubDLSubtitleProvider @Inject constructor(
    private val okHttpClient: OkHttpClient
) : SubtitleProvider {
    
    override val id: String = "subdl"
    override val name: String = "SubDL"
    
    private val api: SubDLApi by lazy {
        val retrofit = Retrofit.Builder()
            .baseUrl("https://api.subdl.com/")
            .client(okHttpClient)
            .addConverterFactory(
                kotlinx.serialization.json.Json {
                    ignoreUnknownKeys = true
                    isLenient = true
                }.asConverterFactory("application/json".toMediaType())
            )
            .build()
        retrofit.create(SubDLApi::class.java)
    }
    
    override suspend fun isAvailable(): Boolean = true
    
    override suspend fun searchMovie(
        imdbId: String?,
        tmdbId: String?,
        title: String,
        year: Int?,
        language: String?
    ): List<Subtitle> {
        return try {
            val response = if (imdbId != null) {
                api.searchByImdb(imdbId, language)
            } else if (tmdbId != null) {
                api.searchByTmdb(tmdbId, language)
            } else {
                api.searchByQuery(title, year, language)
            }
            response.subtitles?.map { it.toDomain() } ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    override suspend fun searchEpisode(
        imdbId: String?,
        tmdbId: String?,
        seriesTitle: String,
        season: Int,
        episode: Int,
        language: String?
    ): List<Subtitle> {
        return try {
            val response = if (imdbId != null) {
                api.searchSeriesByImdb(imdbId, season, episode, language)
            } else {
                api.searchSeriesByQuery(seriesTitle, season, episode, language)
            }
            response.subtitles?.map { it.toDomain() } ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }
}

private interface SubDLApi {
    @GET("subtitles")
    suspend fun searchByImdb(
        @Query("imdb_id") imdbId: String,
        @Query("languages") language: String?
    ): SubDLResponse
    
    @GET("subtitles")
    suspend fun searchByTmdb(
        @Query("tmdb_id") tmdbId: String,
        @Query("languages") language: String?
    ): SubDLResponse
    
    @GET("subtitles")
    suspend fun searchByQuery(
        @Query("query") query: String,
        @Query("year") year: Int?,
        @Query("languages") language: String?
    ): SubDLResponse
    
    @GET("subtitles/series")
    suspend fun searchSeriesByImdb(
        @Query("imdb_id") imdbId: String,
        @Query("season") season: Int,
        @Query("episode") episode: Int,
        @Query("languages") language: String?
    ): SubDLResponse
    
    @GET("subtitles/series")
    suspend fun searchSeriesByQuery(
        @Query("query") query: String,
        @Query("season") season: Int,
        @Query("episode") episode: Int,
        @Query("languages") language: String?
    ): SubDLResponse
}

@kotlinx.serialization.Serializable
private data class SubDLResponse(
    val subtitles: List<SubDLSubtitle>?
)

@kotlinx.serialization.Serializable
private data class SubDLSubtitle(
    val id: String?,
    val url: String?,
    val language: String?,
    val release: String?,
    val format: String?
)

private fun SubDLSubtitle.toDomain(): Subtitle {
    return Subtitle(
        id = id,
        url = url ?: "",
        lang = language
    )
}
