package site.zizi.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import dagger.hilt.android.AndroidEntryPoint
import site.zizi.android.ui.tv.TvHomeScreen
import site.zizi.android.ui.tv.TvNavigation

/**
 * Main Activity for Zizi Android
 * Supports both phone/tablet and TV interfaces
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        setContent {
            val viewModel: MainViewModel = hiltViewModel()
            val isDarkMode by viewModel.isDarkMode.collectAsState(true)
            
            MaterialTheme(
                colorScheme = if (isDarkMode) {
                    androidx.compose.material3.darkColorScheme()
                } else {
                    androidx.compose.material3.lightColorScheme()
                }
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    // Check if running on TV
                    val isTv = packageManager.hasSystemFeature(
                        android.content.pm.PackageManager.FEATURE_LEANBACK
                    )
                    
                    if (isTv) {
                        TvNavigation()
                    } else {
                        // Phone/tablet navigation will be implemented separately
                        TvNavigation() // Using TV nav as placeholder for now
                    }
                }
            }
        }
    }
}
