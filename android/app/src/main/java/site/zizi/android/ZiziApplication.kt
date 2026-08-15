package site.zizi.android

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

/**
 * Zizi Android Application class
 * Entry point for Hilt dependency injection
 */
@HiltAndroidApp
class ZiziApplication : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
