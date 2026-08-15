package site.harbor.android.player

import android.content.Context
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Harbor Player Manager using Media3/ExoPlayer
 * Handles video playback with support for HLS, DASH, and progressive streams
 */
class HarborPlayer(private val context: Context) {
    
    private var exoPlayer: ExoPlayer? = null
    
    sealed class PlayerState {
        object Idle : PlayerState()
        object Buffering : PlayerState()
        object Ready : PlayerState()
        object Ended : PlayerState()
        data class Error(val exception: PlaybackException) : PlayerState()
    }
    
    private val _playerState = MutableStateFlow<PlayerState>(PlayerState.Idle)
    val playerState: StateFlow<PlayerState> = _playerState.asStateFlow()
    
    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()
    
    private val _currentPosition = MutableStateFlow(0L)
    val currentPosition: StateFlow<Long> = _currentPosition.asStateFlow()
    
    private val _duration = MutableStateFlow(0L)
    val duration: StateFlow<Long> = _duration.asStateFlow()
    
    /**
     * Initialize the player
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
                    
                    override fun onPlayerError(error: PlaybackException) {
                        _playerState.value = PlayerState.Error(error)
                    }
                })
            }
        }
    }
    
    /**
     * Set media source and prepare for playback
     */
    fun setMediaSource(url: String, subtitleUrls: List<String> = emptyList()) {
        exoPlayer?.let { player ->
            val mediaItem = MediaItem.fromUri(url)
            player.setMediaItem(mediaItem)
            player.prepare()
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
     * Seek to position
     */
    fun seekTo(positionMs: Long) {
        exoPlayer?.seekTo(positionMs)
    }
    
    /**
     * Seek forward by specified amount
     */
    fun seekForward(amountMs: Long = 10000L) {
        val newPosition = (currentPosition.value + amountMs).coerceAtMost(duration.value)
        seekTo(newPosition)
    }
    
    /**
     * Seek backward by specified amount
     */
    fun seekBackward(amountMs: Long = 10000L) {
        val newPosition = (currentPosition.value - amountMs).coerceAtLeast(0L)
        seekTo(newPosition)
    }
    
    /**
     * Set playback speed
     */
    fun setPlaybackSpeed(speed: Float) {
        exoPlayer?.setPlaybackSpeed(speed.coerceIn(0.25f, 4.0f))
    }
    
    /**
     * Get current playback speed
     */
    fun getPlaybackSpeed(): Float = exoPlayer?.playbackParameters?.speed ?: 1.0f
    
    /**
     * Release player resources
     */
    fun release() {
        exoPlayer?.release()
        exoPlayer = null
    }
    
    /**
     * Get the underlying ExoPlayer instance for advanced operations
     */
    fun getPlayer(): Player? = exoPlayer
}
