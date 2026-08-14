package site.harbor.android

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import site.harbor.android.data.local.LocalRepository

/**
 * Main ViewModel for Harbor Android
 */
@HiltViewModel
class MainViewModel @Inject constructor(
    private val localRepository: LocalRepository
) : ViewModel() {
    
    val isDarkMode: Flow<Boolean> = localRepository.darkModeFlow
    
    fun setDarkMode(enabled: Boolean) {
        // Will be implemented in settings
    }
}
