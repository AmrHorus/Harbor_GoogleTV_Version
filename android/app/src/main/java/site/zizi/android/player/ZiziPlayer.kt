package site.zizi.android.player

import android.content.Context
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Wrapper around ExoPlayer for media playback
 */
@Singleton
class ZiziPlayer @Inject constructor(
    private val context: Context
) {
    private var exoPlayer: ExoPlayer? = null
    
    private val _playerState = MutableStateFlow<PlayerState>(PlayerState.Idle)
    val playerState: StateFlow<PlayerState> = _playerState.asStateFlow()
    
    private val _currentPosition = MutableStateFlow(0L)
    val currentPosition: StateFlow<Long> = _currentPosition.asStateFlow()
    
    private val _duration = MutableStateFlow(0L)
    val duration: StateFlow<Long> = _duration.asStateFlow()
    
    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()
    
    /**
     * Initialize the ExoPlayer instance
     */
    fun initialize() {
        if (exoPlayer == null) {
            exoPlayer = ExoPlayer.Builder(context).build().apply {
                addListener(object : Player.Listener {
                    override fun onPlaybackStateChanged(state: Int) {
                        _playerState.value = when (state) {
                            Player.STATE_IDLE -> PlayerState.Idle
                            Player.STATE_BUFFERING -> PlayerState.Buffering
                            Player.STATE_READY -> PlayerState.Ready
                            Player.STATE_ENDED -> PlayerState.Ended
                            else -> PlayerState.Idle
                        }
                    }
                    
                    override fun onIsPlayingChanged(isPlaying: Boolean) {
                        _isPlaying.value = isPlaying
                    }
                    
                    override fun onPlaybackError(error: PlaybackException) {
                        _playerState.value = PlayerState.Error(error.message ?: "Unknown playback error")
                    }
                })
            }
        }
    }
    
    /**
     * Set the media URL and prepare for playback
     */
    fun setMediaUrl(url: String, startPosition: Long = 0L) {
        exoPlayer?.let { player ->
            val mediaItem = MediaItem.fromUri(url)
            player.setMediaItem(mediaItem, startPosition)
            player.prepare()
            _playerState.value = PlayerState.Buffering
        }
    }
    
    /**
     * Start or resume playback
     */
    fun play() {
        exoPlayer?.play()
    }
    
    /**
     * Pause playback
     */
    fun pause() {
        exoPlayer?.pause()
    }
    
    /**
     * Seek to a specific position
     */
    fun seekTo(positionMs: Long) {
        exoPlayer?.seekTo(positionMs)
    }
    
    /**
     * Seek forward by specified milliseconds
     */
    fun seekForward(byMs: Long = 10000L) {
        val newPosition = (exoPlayer?.currentPosition ?: 0L) + byMs
        exoPlayer?.seekTo(newPosition.coerceAtMost(exoPlayer?.duration ?: 0L))
    }
    
    /**
     * Seek backward by specified milliseconds
     */
    fun seekBackward(byMs: Long = 10000L) {
        val newPosition = (exoPlayer?.currentPosition ?: 0L) - byMs
        exoPlayer?.seekTo(newPosition.coerceAtLeast(0L))
    }
    
    /**
     * Get current playback speed
     */
    fun getPlaybackSpeed(): Float {
        return exoPlayer?.playbackParameters?.speed ?: 1.0f
    }
    
    /**
     * Set playback speed
     */
    fun setPlaybackSpeed(speed: Float) {
        exoPlayer?.setPlaybackSpeed(speed)
    }
    
    /**
     * Release the player resources
     */
    fun release() {
        exoPlayer?.release()
        exoPlayer = null
        _playerState.value = PlayerState.Idle
    }
    
    /**
     * Get the underlying ExoPlayer instance for advanced operations
     */
    fun getPlayer(): Player? = exoPlayer
}

/**
 * Sealed class representing player states
 */
sealed class PlayerState {
    object Idle : PlayerState()
    object Buffering : PlayerState()
    object Ready : PlayerState()
    object Ended : PlayerState()
    data class Error(val message: String) : PlayerState()
}
