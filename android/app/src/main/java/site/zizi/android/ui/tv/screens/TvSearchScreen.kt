package site.zizi.android.ui.tv.screens

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.tv.material3.*

@Composable
fun TvSearchScreen(
    onNavigateToDetails: (type: String, id: String) -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = androidx.compose.ui.Alignment.Center
    ) {
        Text(
            text = "Search",
            style = MaterialTheme.typography.displayMedium
        )
    }
}

@Preview(device = "id:Android TV (720p)")
@Composable
fun TvSearchScreenPreview() {
    TvSearchScreen(onNavigateToDetails = { _, _ -> })
}
