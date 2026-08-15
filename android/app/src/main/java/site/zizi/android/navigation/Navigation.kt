package site.zizi.android.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import site.zizi.android.ui.tv.screens.TvHomeScreen
import site.zizi.android.ui.tv.screens.TvSearchScreen
import site.zizi.android.ui.tv.screens.TvLibraryScreen
import site.zizi.android.ui.tv.screens.TvDetailsScreen
import site.zizi.android.ui.tv.screens.TvPlayerScreen
import site.zizi.android.ui.tv.screens.TvSettingsScreen

/**
 * Navigation routes for the Android application
 */
sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Search : Screen("search")
    object Library : Screen("library")
    object Discover : Screen("discover")
    object Movies : Screen("movies")
    object Series : Screen("series")
    object Anime : Screen("anime")
    object LiveTv : Screen("live_tv")
    object Settings : Screen("settings")
    object Details : Screen("details/{type}/{id}") {
        fun createRoute(type: String, id: String) = "details/$type/$id"
    }
    object Player : Screen("player/{type}/{id}/{streamUrl}") {
        fun createRoute(type: String, id: String, streamUrl: String) = 
            "player/$type/$id/${java.net.URLEncoder.encode(streamUrl, \"UTF-8\")}"
    }
}

/**
 * Set up the navigation graph for TV
 */
@Composable
fun TvNavGraph(
    navController: NavHostController,
    startDestination: String = Screen.Home.route,
    onNavigateToDetails: (type: String, id: String) -> Unit,
    onNavigateToPlayer: (type: String, id: String, streamUrl: String) -> Unit
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Home.route) {
            TvHomeScreen(
                onNavigateToDetails = { type, id ->
                    navController.navigate(Screen.Details.createRoute(type, id))
                },
                onNavigateToPlayer = { type, id, streamUrl ->
                    navController.navigate(Screen.Player.createRoute(type, id, streamUrl))
                }
            )
        }
        
        composable(Screen.Search.route) {
            TvSearchScreen(
                onNavigateToDetails = { type, id ->
                    navController.navigate(Screen.Details.createRoute(type, id))
                }
            )
        }
        
        composable(Screen.Library.route) {
            TvLibraryScreen(
                onNavigateToDetails = { type, id ->
                    navController.navigate(Screen.Details.createRoute(type, id))
                },
                onNavigateToPlayer = { type, id, streamUrl ->
                    navController.navigate(Screen.Player.createRoute(type, id, streamUrl))
                }
            )
        }
        
        composable(
            route = Screen.Details.route,
            arguments = listOf(
                navArgument("type") { type = NavType.StringType },
                navArgument("id") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val type = backStackEntry.arguments?.getString("type") ?: "movie"
            val id = backStackEntry.arguments?.getString("id") ?: ""
            
            TvDetailsScreen(
                type = type,
                id = id,
                onNavigateBack = { navController.popBackStack() },
                onPlay = { streamUrl ->
                    navController.navigate(Screen.Player.createRoute(type, id, streamUrl))
                }
            )
        }
        
        composable(
            route = Screen.Player.route,
            arguments = listOf(
                navArgument("type") { type = NavType.StringType },
                navArgument("id") { type = NavType.StringType },
                navArgument("streamUrl") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val type = backStackEntry.arguments?.getString("type") ?: "movie"
            val id = backStackEntry.arguments?.getString("id") ?: ""
            val streamUrl = backStackEntry.arguments?.getString("streamUrl") 
                ?.let { java.net.URLDecoder.decode(it, "UTF-8") } ?: ""
            
            TvPlayerScreen(
                type = type,
                id = id,
                streamUrl = streamUrl,
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(Screen.Settings.route) {
            TvSettingsScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
