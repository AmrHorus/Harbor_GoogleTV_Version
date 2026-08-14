package site.harbor.android

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

/**
 * Harbor Android Application class
 * Entry point for the application with Hilt DI
 */
@HiltAndroidApp
class HarborApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        // Initialize any global state here
    }
}
