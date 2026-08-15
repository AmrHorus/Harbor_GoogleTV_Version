package site.harbor.android.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import site.harbor.android.domain.model.LibraryItem

/**
 * Local data store for Harbor Android
 * Handles preferences, watch history, and local library
 */

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "harbor_preferences")

class LocalRepository(private val context: Context) {
    
    companion object {
        // Preference keys
        val AUTH_TOKEN = stringPreferencesKey("auth_token")
        val SELECTED_LANGUAGE = stringPreferencesKey("selected_language")
        val DARK_MODE = booleanPreferencesKey("dark_mode")
        val AUTO_PLAY = booleanPreferencesKey("auto_play")
        val SUBTITLE_SIZE = stringPreferencesKey("subtitle_size")
        val PLAYBACK_SPEED = stringPreferencesKey("playback_speed")
        
        // Watch history key pattern: "watch_history:{id}:{season}:{episode}"
        private const val WATCH_HISTORY_PREFIX = "watch_history:"
        private const val LIBRARY_PREFIX = "library:"
    }
    
    /**
     * Get auth token flow
     */
    val authTokenFlow: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[AUTH_TOKEN]
    }
    
    /**
     * Save auth token
     */
    suspend fun saveAuthToken(token: String) {
        context.dataStore.edit { preferences ->
            preferences[AUTH_TOKEN] = token
        }
    }
    
    /**
     * Clear auth token
     */
    suspend fun clearAuthToken() {
        context.dataStore.edit { preferences ->
            preferences.remove(AUTH_TOKEN)
        }
    }
    
    /**
     * Get dark mode preference
     */
    val darkModeFlow: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[DARK_MODE] ?: true
    }
    
    /**
     * Set dark mode preference
     */
    suspend fun setDarkMode(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[DARK_MODE] = enabled
        }
    }
    
    /**
     * Save watch progress
     */
    suspend fun saveWatchProgress(
        id: String,
        timeOffset: Long,
        duration: Long,
        season: Int? = null,
        episode: Int? = null
    ) {
        val key = "${WATCH_HISTORY_PREFIX}${id}:${season ?: 0}:${episode ?: 0}"
        context.dataStore.edit { preferences ->
            preferences[stringPreferencesKey(key)] = "$timeOffset,$duration"
        }
    }
    
    /**
     * Get watch progress
     */
    suspend fun getWatchProgress(
        id: String,
        season: Int? = null,
        episode: Int? = null
    ): Pair<Long, Long>? {
        val key = "${WATCH_HISTORY_PREFIX}${id}:${season ?: 0}:${episode ?: 0}"
        val data = context.dataStore.data.map { preferences ->
            preferences[stringPreferencesKey(key)]
        }.value
        
        return data?.let {
            val parts = it.split(",")
            if (parts.size == 2) {
                parts[0].toLongOrNull()?.let { offset ->
                    parts[1].toLongOrNull()?.let { dur ->
                        offset to dur
                    }
                }
            } else null
        }
    }
    
    /**
     * Add item to library
     */
    suspend fun addToLibrary(item: LibraryItem) {
        val key = "${LIBRARY_PREFIX}${item.id}"
        context.dataStore.edit { preferences ->
            preferences[stringPreferencesKey(key)] = NetworkConfig.json.encodeToString(
                site.harbor.android.domain.model.LibraryItem.serializer(),
                item
            )
        }
    }
    
    /**
     * Remove item from library
     */
    suspend fun removeFromLibrary(id: String) {
        val key = "${LIBRARY_PREFIX}$id"
        context.dataStore.edit { preferences ->
            preferences.remove(stringPreferencesKey(key))
        }
    }
    
    /**
     * Check if item is in library
     */
    suspend fun isInLibrary(id: String): Boolean {
        val key = "${LIBRARY_PREFIX}$id"
        return context.dataStore.data.map { preferences ->
            preferences.contains(stringPreferencesKey(key))
        }.value ?: false
    }
    
    /**
     * Get all library items
     */
    suspend fun getLibraryItems(): List<LibraryItem> {
        val prefs = context.dataStore.data.value
        return prefs.asMap()
            .filterKeys { it.name.startsWith(LIBRARY_PREFIX) }
            .mapNotNull { (_, value) ->
                if (value is String) {
                    try {
                        NetworkConfig.json.decodeFromString(
                            site.harbor.android.domain.model.LibraryItem.serializer(),
                            value
                        )
                    } catch (e: Exception) {
                        null
                    }
                } else null
            }
    }
}
