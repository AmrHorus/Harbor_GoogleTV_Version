package site.harbor.android.data.repository

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import retrofit2.HttpException
import site.harbor.android.data.network.AddonApi
import site.harbor.android.data.network.NetworkConfig
import site.harbor.android.domain.model.AddonManifest
import site.harbor.android.domain.model.CatalogResponse
import site.harbor.android.domain.model.Meta
import site.harbor.android.domain.model.MetaResponse
import site.harbor.android.domain.model.Stream
import site.harbor.android.domain.model.StreamResponse
import java.io.IOException

/**
 * Repository for addon operations
 * Implements the Stremio addon protocol
 */
class AddonRepository {
    
    private val api: AddonApi by lazy {
        NetworkConfig.createRetrofit("https://v3-cinemeta.strem.io/").create(AddonApi::class.java)
    }
    
    /**
     * Fetch manifest from an addon URL
     */
    suspend fun getManifest(addonUrl: String): Result<AddonManifest> {
        return try {
            // Ensure URL ends with /manifest.json
            val manifestUrl = if (addonUrl.endsWith("/manifest.json")) {
                addonUrl
            } else {
                "${addonUrl.removeSuffix("/")}/manifest.json"
            }
            
            val client = NetworkConfig.okHttpClient
            val request = okhttp3.Request.Builder()
                .url(manifestUrl)
                .build()
            
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    return Result.failure(Exception("Failed to fetch manifest: ${response.code}"))
                }
                
                val body = response.body?.string()
                    ?: return Result.failure(Exception("Empty manifest response"))
                
                val manifest = NetworkConfig.json.decodeFromString<AddonManifest>(body)
                Result.success(manifest)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get catalog from Cinemeta or other addons
     */
    suspend fun getCatalog(
        baseUrl: String,
        type: String,
        catalogId: String,
        skip: Int? = null
    ): Result<List<Meta>> {
        return try {
            val retrofit = NetworkConfig.createRetrofit(baseUrl)
            val addonApi = retrofit.create(AddonApi::class.java)
            val response = addonApi.getCatalog(type, catalogId, skip)
            Result.success(response.metas)
        } catch (e: HttpException) {
            Result.failure(e)
        } catch (e: IOException) {
            Result.failure(e)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get metadata for a specific item
     */
    suspend fun getMeta(
        baseUrl: String,
        type: String,
        id: String
    ): Result<Meta> {
        return try {
            val retrofit = NetworkConfig.createRetrofit(baseUrl)
            val addonApi = retrofit.create(AddonApi::class.java)
            val response = addonApi.getMeta(type, id)
            Result.success(response.meta)
        } catch (e: HttpException) {
            Result.failure(e)
        } catch (e: IOException) {
            Result.failure(e)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get streams for a specific item
     */
    suspend fun getStreams(
        baseUrl: String,
        type: String,
        id: String
    ): Result<List<Stream>> {
        return try {
            val retrofit = NetworkConfig.createRetrofit(baseUrl)
            val addonApi = retrofit.create(AddonApi::class.java)
            val response = addonApi.getStreams(type, id)
            Result.success(response.streams.map { stream ->
                stream.copy(addonId = baseUrl.hashCode().toString())
            })
        } catch (e: HttpException) {
            Result.failure(e)
        } catch (e: IOException) {
            Result.failure(e)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Search for content across addons
     */
    suspend fun search(
        baseUrl: String,
        type: String,
        query: String
    ): Result<List<Meta>> {
        return try {
            // Use stream endpoint with search parameter
            val retrofit = NetworkConfig.createRetrofit(baseUrl)
            val addonApi = retrofit.create(AddonApi::class.java)
            val response = addonApi.getStreamsWithExtra(type, "search=$query.json".replace("=", "/"))
            // This is a simplified search - real implementation would parse the response differently
            Result.success(emptyList())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Flow-based catalog fetching with error handling
     */
    fun getCatalogFlow(
        baseUrl: String,
        type: String,
        catalogId: String
    ): Flow<Result<List<Meta>>> = flow {
        emit(getCatalog(baseUrl, type, catalogId))
    }.catch { e ->
        emit(Result.failure(e))
    }.flowOn(Dispatchers.IO)
}
