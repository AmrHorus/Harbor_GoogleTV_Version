package site.harbor.android.ui.tv

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import site.harbor.android.ui.tv.screens.TvHomeScreen
import site.harbor.android.ui.tv.screens.TvSearchScreen
import site.harbor.android.ui.tv.screens.TvLibraryScreen
import site.harbor.android.ui.tv.screens.TvDetailsScreen
import site.harbor.android.ui.tv.screens.TvPlayerScreen
import site.harbor.android.ui.tv.screens.TvSettingsScreen

/**
 * TV Navigation graph
 * Defines all navigation destinations for Android TV
 */
sealed class TvNavRoute(val route: String) {
    object Home : TvNavRoute("home")
    object Search : TvNavRoute("search")
    object Library : TvNavRoute("library")
    object Details : TvNavRoute("details/{id}") {
        fun createRoute(id: String) = "details/$id"
    }
    object Player : TvNavRoute("player/{id}") {
        fun createRoute(id: String) = "player/$id"
    }
    object Settings : TvNavRoute("settings")
}

@Composable
fun TvNavigation() {
    val navController = rememberNavController()
    
    NavHost(
        navController = navController,
        startDestination = TvNavRoute.Home.route
    ) {
        composable(TvNavRoute.Home.route) {
            TvHomeScreen(
                onNavigateToSearch = { navController.navigate(TvNavRoute.Search.route) },
                onNavigateToLibrary = { navController.navigate(TvNavRoute.Library.route) },
                onNavigateToDetails = { id -> 
                    navController.navigate(TvNavRoute.Details.createRoute(id))
                },
                onNavigateToSettings = { navController.navigate(TvNavRoute.Settings.route) }
            )
        }
        
        composable(TvNavRoute.Search.route) {
            TvSearchScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToDetails = { id ->
                    navController.navigate(TvNavRoute.Details.createRoute(id))
                }
            )
        }
        
        composable(TvNavRoute.Library.route) {
            TvLibraryScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToDetails = { id ->
                    navController.navigate(TvNavRoute.Details.createRoute(id))
                }
            )
        }
        
        composable(TvNavRoute.Details.route) { backStackEntry ->
            val id = backStackEntry.arguments?.getString("id") ?: return@composable
            TvDetailsScreen(
                itemId = id,
                onNavigateBack = { navController.popBackStack() },
                onPlay = { streamUrl ->
                    navController.navigate(TvNavRoute.Player.createRoute(id))
                }
            )
        }
        
        composable(TvNavRoute.Player.route) { backStackEntry ->
            val id = backStackEntry.arguments?.getString("id") ?: return@composable
            TvPlayerScreen(
                itemId = id,
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(TvNavRoute.Settings.route) {
            TvSettingsScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
