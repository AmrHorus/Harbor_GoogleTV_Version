package site.harbor.android.di

import android.content.Context
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import site.harbor.android.data.local.LocalRepository
import site.harbor.android.data.repository.AddonRepository
import site.harbor.android.player.HarborPlayer
import javax.inject.Singleton

/**
 * Hilt dependency injection module
 */
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    
    @Provides
    @Singleton
    fun provideLocalRepository(
        @ApplicationContext context: Context
    ): LocalRepository {
        return LocalRepository(context)
    }
    
    @Provides
    @Singleton
    fun provideAddonRepository(): AddonRepository {
        return AddonRepository()
    }
    
    @Provides
    @Singleton
    fun provideHarborPlayer(
        @ApplicationContext context: Context
    ): HarborPlayer {
        return HarborPlayer(context)
    }
}
