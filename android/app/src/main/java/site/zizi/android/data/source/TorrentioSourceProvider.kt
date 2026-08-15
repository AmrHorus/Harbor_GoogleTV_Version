package site.zizi.android.data.source

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import retrofit2.http.GET
import retrofit2.http.Path
import site.zizi.android.domain.model.Stream
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.time.Duration.Companion.minutes
import kotlin.time.toJavaDuration

/**
 * Torrentio source provider implementation
 * Integrates with Torrentio addon for torrent-based streams
 * https://torrentio.org/
 */
@Singleton
class TorrentioSourceProvider @Inject constructor(
    private val okHttpClient: OkHttpClient
) : SourceProvider {
    
    override val id: String = "torrentio"
    override val name: String = "Torrentio"
    
    private val api: TorrentioApi by lazy {
        val retrofit = Retrofit.Builder()
            .baseUrl("https://torrentio.strem.fun/")
            .client(okHttpClient)
            .addConverterFactory(
                kotlinx.serialization.json.Json {
                    ignoreUnknownKeys = true
                    isLenient = true
                }.asConverterFactory("application/json".toMediaType())
            )
            .build()
        retrofit.create(TorrentioApi::class.java)
    }
    
    override suspend fun isAvailable(): Boolean = true
    
    override suspend fun searchMovie(
        imdbId: String?,
        title: String,
        year: Int?
    ): List<Stream> {
        if (imdbId == null) return emptyList()
        
        return try {
            val response = api.getStreams("movie", imdbId)
            response.streams.map { stream ->
                stream.copy(addonId = id, addonName = name)
            }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    override suspend fun searchEpisode(
        imdbId: String?,
        title: String,
        season: Int,
        episode: Int
    ): List<Stream> {
        if (imdbId == null) return emptyList()
        
        return try {
            val response = api.getStreams("series", imdbId)
            response.streams.map { stream ->
                stream.copy(addonId = id, addonName = name)
            }
        } catch (e: Exception) {
            emptyList()
        }
    }
}

private interface TorrentioApi {
    @GET("stream/{type}/{id}.json")
    suspend fun getStreams(
        @Path("type") type: String,
        @Path("id") id: String
    ): StreamResponse
}

@Serializable
private data class StreamResponse(
    val streams: List<Stream>
)

@Serializable
private data class Stream(
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
private data class Subtitle(
    val id: String? = null,
    val url: String,
    val lang: String? = null
)

@Serializable
private data class BehaviorHints(
    val notWebReady: Boolean? = null,
    val bingeGroup: String? = null,
    val countryWhitelist: List<String>? = null,
    val adult: Boolean? = null
)
