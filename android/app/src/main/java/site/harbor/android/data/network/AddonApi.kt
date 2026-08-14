package site.harbor.android.data.network

import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.http.Url
import site.harbor.android.domain.model.AddonManifest
import site.harbor.android.domain.model.CatalogResponse
import site.harbor.android.domain.model.MetaResponse
import site.harbor.android.domain.model.StreamResponse

/**
 * API service for Stremio addon protocol
 * https://github.com/Stremio/stremio-addon-spec
 */
interface AddonApi {
    
    /**
     * Get addon manifest
     * @param manifestUrl The full URL to the manifest endpoint
     */
    @GET
    suspend fun getManifest(
        @Url manifestUrl: String
    ): AddonManifest
    
    /**
     * Get catalog of metas
     * @param baseUrl Base URL of the addon
     * @param type Type filter (movie, series, etc.)
     * @param catalogId Catalog identifier
     * @param skip Optional pagination offset
     */
    @GET("{type}/{catalogId}.json")
    suspend fun getCatalog(
        @Path("type") type: String,
        @Path("catalogId") catalogId: String,
        @Query("skip") skip: Int? = null
    ): CatalogResponse
    
    /**
     * Get metadata for a specific item
     * @param baseUrl Base URL of the addon
     * @param type Type (movie, series, etc.)
     * @param id Item ID
     */
    @GET("meta/{type}/{id}.json")
    suspend fun getMeta(
        @Path("type") type: String,
        @Path("id") id: String
    ): MetaResponse
    
    /**
     * Get streams for a specific item
     * @param baseUrl Base URL of the addon
     * @param type Type (movie, series, etc.)
     * @param id Item ID
     */
    @GET("stream/{type}/{id}.json")
    suspend fun getStreams(
        @Path("type") type: String,
        @Path("id") id: String
    ): StreamResponse
    
    /**
     * Get streams with extra parameters (for search, genre, etc.)
     * @param baseUrl Base URL of the addon
     * @param type Type (movie, series, etc.)
     * @param id Item ID or search query
     */
    @GET("stream/{type}/{id}.json")
    suspend fun getStreamsWithExtra(
        @Path("type") type: String,
        @Path("id") id: String,
        @Query("search") search: String? = null,
        @Query("genre") genre: String? = null,
        @Query("skip") skip: Int? = null
    ): StreamResponse
}
