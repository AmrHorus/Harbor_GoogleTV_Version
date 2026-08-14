package site.harbor.android.player

import android.content.Context
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService

/**
 * MediaSession Service for background playback support on Android TV
 */
class PlaybackService : MediaSessionService() {
    
    private var mediaSession: MediaSession? = null
    
    override fun onCreate() {
        super.onCreate()
        // Initialize media session when service starts
        mediaSession = MediaSession.Builder(this, createPlayer()).build()
    }
    
    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? {
        return mediaSession
    }
    
    override fun onDestroy() {
        mediaSession?.release()
        super.onDestroy()
    }
}
