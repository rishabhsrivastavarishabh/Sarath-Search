package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.SearchViewModel
import com.example.ui.components.AboutDialog
import com.example.ui.components.BangsDialog
import com.example.ui.components.LensSearchDialog
import com.example.ui.components.PrivacyDialog
import com.example.ui.components.SettingsDialog
import com.example.ui.components.VoiceSearchDialog
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.ResultsScreen
import com.example.ui.theme.SarathSearchTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SarathSearchApp()
        }
    }
}

@Composable
fun SarathSearchApp(
    viewModel: SearchViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val systemDark = isSystemInDarkTheme()
    val effectiveDarkMode = uiState.sessionDarkMode ?: systemDark

    var showSettingsDialog by remember { mutableStateOf(false) }
    var showBangsDialog by remember { mutableStateOf(false) }
    var showPrivacyDialog by remember { mutableStateOf(false) }
    var showAboutDialog by remember { mutableStateOf(false) }
    var showVoiceSearchDialog by remember { mutableStateOf(false) }
    var showLensSearchDialog by remember { mutableStateOf(false) }

    // System Back button returns to Home screen if currently showing results
    BackHandler(enabled = uiState.hasSearched) {
        viewModel.clearSearch()
    }

    SarathSearchTheme(darkTheme = effectiveDarkMode) {
        Scaffold(modifier = Modifier.fillMaxSize()) { _ ->
            if (!uiState.hasSearched) {
                HomeScreen(
                    query = uiState.query,
                    onQueryChange = { viewModel.onQueryChange(it) },
                    onSearchSubmit = { custom -> viewModel.executeSearch(custom) },
                    selectedFilter = uiState.selectedLanguageFilter,
                    onFilterSelect = { viewModel.setLanguageFilter(it) },
                    isDarkMode = effectiveDarkMode,
                    onToggleTheme = { viewModel.toggleDarkMode(effectiveDarkMode) },
                    onOpenSettings = { showSettingsDialog = true },
                    onOpenBangs = { showBangsDialog = true },
                    onOpenPrivacy = { showPrivacyDialog = true },
                    onOpenAbout = { showAboutDialog = true },
                    showDebugView = uiState.showDebugView,
                    onToggleDebugView = { viewModel.toggleDebugView() },
                    onVoiceClick = { showVoiceSearchDialog = true },
                    onLensClick = { showLensSearchDialog = true }
                )
            } else {
                ResultsScreen(
                    uiState = uiState,
                    onQueryChange = { viewModel.onQueryChange(it) },
                    onSearchSubmit = { custom -> viewModel.executeSearch(custom) },
                    onGoHome = { viewModel.clearSearch() },
                    onFilterSelect = { viewModel.setLanguageFilter(it) },
                    onTabSelect = { viewModel.setSelectedTab(it) },
                    isDarkMode = effectiveDarkMode,
                    onToggleTheme = { viewModel.toggleDarkMode(effectiveDarkMode) },
                    onToggleDebugView = { viewModel.toggleDebugView() },
                    onFeedback = { url, isUp -> viewModel.recordFeedback(url, isUp) },
                    onDismissBang = { viewModel.dismissBang() },
                    onVoiceClick = { showVoiceSearchDialog = true },
                    onLensClick = { showLensSearchDialog = true }
                )
            }

            // Dialogs
            if (showSettingsDialog) {
                SettingsDialog(
                    safeSearchEnabled = uiState.safeSearch,
                    onSafeSearchChange = { viewModel.setSafeSearch(it) },
                    regionBias = uiState.regionBias,
                    onRegionBiasChange = { viewModel.setRegionBias(it) },
                    isDarkMode = effectiveDarkMode,
                    onToggleTheme = { viewModel.toggleDarkMode(effectiveDarkMode) },
                    showDebugView = uiState.showDebugView,
                    onToggleDebugView = { viewModel.toggleDebugView() },
                    onDismiss = { showSettingsDialog = false }
                )
            }

            if (showBangsDialog) {
                BangsDialog(
                    onDismiss = { showBangsDialog = false },
                    onSelectBang = { bangTrigger ->
                        viewModel.onQueryChange("$bangTrigger ")
                        showBangsDialog = false
                    }
                )
            }

            if (showPrivacyDialog) {
                PrivacyDialog(onDismiss = { showPrivacyDialog = false })
            }

            if (showAboutDialog) {
                AboutDialog(onDismiss = { showAboutDialog = false })
            }

            if (showVoiceSearchDialog) {
                VoiceSearchDialog(
                    onDismiss = { showVoiceSearchDialog = false },
                    onVoiceResult = { spokenQuery ->
                        showVoiceSearchDialog = false
                        viewModel.onQueryChange(spokenQuery)
                        viewModel.executeSearch(spokenQuery)
                    }
                )
            }

            if (showLensSearchDialog) {
                LensSearchDialog(
                    onDismiss = { showLensSearchDialog = false },
                    onExecuteLensSearch = { detectedQuery ->
                        showLensSearchDialog = false
                        viewModel.onQueryChange(detectedQuery)
                        viewModel.executeSearch(detectedQuery)
                    }
                )
            }
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    androidx.compose.material3.Text(text = "Hello $name!", modifier = modifier)
}

