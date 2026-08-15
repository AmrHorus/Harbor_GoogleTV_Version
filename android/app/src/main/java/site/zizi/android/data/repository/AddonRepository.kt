package site.zizi.android.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.flow
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import site.zizi.android.data.network.AddonApi
import site.zizi.android.domain.model.AddonManifest
import site.zizi.android.domain.model.CatalogResponse
import site.zizi.android.domain.model.MetaResponse
import site.zizi.android.domain.model.StreamResponse
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository for interacting with Stremio addons
 */
@Singleton
class AddonRepository @Inject constructor(
    private val addonApi: AddonApi
) {
    /**
     * Fetch addon manifest from a URL
     */
    fun getManifest(manifestUrl: String): Flow<Result<AddonManifest>> = flow {
        val url = manifestUrl.toHttpUrlOrNull()
            ?: throw IllegalArgumentException("Invalid manifest URL")
        
        val result = addonApi.getManifest(manifestUrl)
        emit(Result.success(result))
    }.catch { e ->
        emit(Result.failure(e))
    }

    /**
     * Get catalog of metas from an addon
     */
    fun getCatalog(
        baseUrl: String,
        type: String,
        catalogId: String,
        skip: Int? = null
    ): Flow<Result<CatalogResponse>> = flow {
        // Note: The actual implementation would need to construct the full URL
        // For now, we use the path-based approach defined in AddonApi
        val result = addonApi.getCatalog(type, catalogId, skip)
        emit(Result.success(result))
    }.catch { e ->
        emit(Result.failure(e))
    }

    /**
     * Get metadata for a specific item
     */
    fun getMeta(
        baseUrl: String,
        type: String,
        id: String
    ): Flow<Result<MetaResponse>> = flow {
        val result = addonApi.getMeta(type, id)
        emit(Result.success(result))
    }.catch { e ->
        emit(Result.failure(e))
    }

    /**
     * Get streams for a specific item
     */
    fun getStreams(
        baseUrl: String,
        type: String,
        id: String
    ): Flow<Result<StreamResponse>> = flow {
        val result = addonApi.getStreams(type, id)
        emit(Result.success(result))
    }.catch { e ->
        emit(Result.failure(e))
    }
}
