package site.zizi.android.ui.tv.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.tv.material3.*
import site.zizi.android.domain.model.Meta

/**
 * TV Home Screen with hero section and content rails
 */
@Composable
fun TvHomeScreen(
    onNavigateToDetails: (type: String, id: String) -> Unit,
    onNavigateToPlayer: (type: String, id: String, streamUrl: String) -> Unit
) {
    // Placeholder state - will be connected to real data
    val continueWatching = remember { emptyList<Meta>() }
    val trendingMovies = remember { emptyList<Meta>() }
    val trendingSeries = remember { emptyList<Meta>() }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Hero Section
        HeroSection(
            modifier = Modifier.fillMaxWidth(),
            onPlay = { /* TODO: Implement play action */ },
            onDetails = { /* TODO: Implement details action */ }
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Continue Watching Rail
        if (continueWatching.isNotEmpty()) {
            ContentRail(
                title = "Continue Watching",
                items = continueWatching,
                onItemClick = { meta ->
                    onNavigateToDetails(meta.type, meta.id)
                }
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
        
        // Trending Movies Rail
        ContentRail(
            title = "Trending Movies",
            items = trendingMovies,
            onItemClick = { meta ->
                onNavigateToDetails(meta.type, meta.id)
            }
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Trending Series Rail
        ContentRail(
            title = "Trending Series",
            items = trendingSeries,
            onItemClick = { meta ->
                onNavigateToDetails(meta.type, meta.id)
            }
        )
    }
}

/**
 * Hero section for featured content
 */
@Composable
private fun HeroSection(
    modifier: Modifier = Modifier,
    onPlay: () -> Unit,
    onDetails: () -> Unit
) {
    val focusRequester = remember { FocusRequester() }
    
    Box(
        modifier = modifier
            .height(400.dp)
            .focusRequester(focusRequester)
    ) {
        // Placeholder for backdrop image
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.surfaceVariant
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text(
                    text = "Featured Content",
                    style = MaterialTheme.typography.headlineLarge
                )
            }
        }
        
        // Gradient overlay
        Box(
            modifier = Modifier
                .fillMaxSize()
                .align(Alignment.BottomCenter),
            contentAlignment = Alignment.BottomStart
        ) {
            Column(
                modifier = Modifier.padding(24.dp)
            ) {
                Text(
                    text = "Featured Title",
                    style = MaterialTheme.typography.displayMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = "A brief description of the featured content goes here.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Button(onClick = onPlay) {
                        Text("Play")
                    }
                    
                    Button(onClick = onDetails) {
                        Text("More Info")
                    }
                }
            }
        }
    }
    
    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
    }
}

/**
 * Content rail for displaying a row of content cards
 */
@Composable
private fun ContentRail(
    title: String,
    items: List<Meta>,
    onItemClick: (Meta) -> Unit
) {
    Column {
        Text(
            text = title,
            style = MaterialTheme.typography.titleLarge,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 8.dp)
        )
        
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(horizontal = 8.dp)
        ) {
            if (items.isEmpty()) {
                // Show placeholder cards when no data
                items(5) { index ->
                    PlaceholderCard(
                        onClick = { }
                    )
                }
            } else {
                items(items) { meta ->
                    ContentCard(
                        meta = meta,
                        onClick = { onItemClick(meta) }
                    )
                }
            }
        }
    }
}

/**
 * Content card for displaying media items
 */
@Composable
private fun ContentCard(
    meta: Meta,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .width(150.dp)
            .height(225.dp)
    ) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = meta.name ?: "Unknown",
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(8.dp)
            )
        }
    }
}

/**
 * Placeholder card for loading states or empty rails
 */
@Composable
private fun PlaceholderCard(
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .width(150.dp)
            .height(225.dp)
    ) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Surface(
                modifier = Modifier
                    .fillMaxSize(0.8f),
                color = MaterialTheme.colorScheme.surfaceVariant
            ) {}
        }
    }
}

@Preview(device = "id:Android TV (720p)")
@Composable
fun TvHomeScreenPreview() {
    TvHomeScreen(
        onNavigateToDetails = { _, _ -> },
        onNavigateToPlayer = { _, _, _ -> }
    )
}
