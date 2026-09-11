package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.outlined.BugReport
import androidx.compose.material.icons.outlined.HelpOutline
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.focusTarget
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.LanguageFilter
import com.example.ui.components.ErrorBoundary
import com.example.ui.components.LanguagePillRow
import com.example.ui.components.SearchInputBox
import com.example.ui.components.WheelSpokeMark
import com.example.ui.theme.LocalSarathColors

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun HomeScreen(
    query: String,
    onQueryChange: (String) -> Unit,
    onSearchSubmit: (String?) -> Unit,
    suggestions: List<String> = emptyList(),
    onSelectSuggestion: (String) -> Unit = {},
    recentSearches: List<String> = emptyList(),
    onDeleteRecentQuery: (String) -> Unit = {},
    onClearRecentSearches: () -> Unit = {},
    selectedFilter: LanguageFilter,
    onFilterSelect: (LanguageFilter) -> Unit,
    onOpenSettings: () -> Unit,
    onOpenBangs: () -> Unit,
    onOpenPrivacy: () -> Unit,
    onOpenAbout: () -> Unit,
    showDebugView: Boolean,
    onToggleDebugView: () -> Unit,
    onVoiceClick: () -> Unit,
    onLensClick: () -> Unit
) {
    val colors = LocalSarathColors.current
    val scrollState = rememberScrollState()
    val searchFocusRequester = remember { FocusRequester() }
    val rootFocusRequester = remember { FocusRequester() }

    LaunchedEffect(Unit) {
        rootFocusRequester.requestFocus()
    }

    val trendingQueries = listOf(
        "UPI transaction limits 2026",
        "Vande Bharat sleeper routes",
        "Aadhaar PAN link status",
        "सारथी ड्राइविंग लाइसेंस",
        "Digital Rupee CBDC",
        "Ayushman Bharat Card"
    )

    ErrorBoundary(componentName = "Home Screen") {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .focusRequester(rootFocusRequester)
                .focusTarget()
                .onKeyEvent { keyEvent ->
                    if (keyEvent.type == KeyEventType.KeyDown) {
                        when (keyEvent.key) {
                            Key.Slash -> {
                                searchFocusRequester.requestFocus()
                                true
                            }
                            Key.Escape -> {
                                if (query.isNotEmpty()) {
                                    onQueryChange("")
                                    true
                                } else {
                                    false
                                }
                            }
                            else -> false
                        }
                    } else {
                        false
                    }
                }
                .background(colors.bg)
                .statusBarsPadding()
                .verticalScroll(scrollState)
                .padding(horizontal = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
        // Top action row (Settings & Debug - Settings contains Theme & Bangs)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 12.dp),
            horizontalArrangement = Arrangement.End,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Bangs shortcut button
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.accentGold.copy(alpha = 0.12f))
                    .clickable { onOpenBangs() }
                    .padding(horizontal = 10.dp, vertical = 6.dp)
                    .testTag("open_bangs_button")
            ) {
                Text(
                    text = "!bangs",
                    style = MaterialTheme.typography.labelSmall,
                    color = colors.accentGold,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Debug toggle
            IconButton(
                onClick = onToggleDebugView,
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(if (showDebugView) colors.accentGold.copy(alpha = 0.2f) else colors.surface)
                    .border(1.dp, if (showDebugView) colors.accentGold else colors.border, CircleShape)
                    .testTag("toggle_debug_button")
            ) {
                Icon(
                    imageVector = Icons.Outlined.BugReport,
                    contentDescription = "Debug View",
                    tint = if (showDebugView) colors.accentGold else colors.inkMuted,
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Settings (Theme and Bangs are accessible in Settings)
            IconButton(
                onClick = onOpenSettings,
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(colors.surface)
                    .border(1.dp, colors.border, CircleShape)
                    .testTag("settings_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = "Preferences and Settings",
                    tint = colors.accentTeal,
                    modifier = Modifier.size(18.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(44.dp))

        // Central Signature Wheel/Spoke Mark
        WheelSpokeMark(
            size = 78.dp,
            isSpinning = false,
            modifier = Modifier.testTag("home_wheel_mark")
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Wordmark / Logotype (Fraunces serif display)
        Text(
            text = "Sarath Search",
            style = MaterialTheme.typography.displayLarge,
            color = colors.ink,
            fontFamily = FontFamily.Serif,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(4.dp))

        // Sanskrit subtitle
        Text(
            text = "सारथी · The Navigating Charioteer",
            style = MaterialTheme.typography.labelMedium,
            color = colors.accentGold,
            fontWeight = FontWeight.SemiBold,
            fontSize = 13.sp,
            letterSpacing = 0.5.sp
        )

        Spacer(modifier = Modifier.height(28.dp))

        // Hero Search Input Box
        Box(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.fillMaxWidth()) {
                SearchInputBox(
                    query = query,
                    onQueryChange = onQueryChange,
                    onSearchSubmit = { onSearchSubmit(null) },
                    isHero = true,
                    modifier = Modifier.fillMaxWidth(),
                    onVoiceClick = onVoiceClick,
                    onLensClick = onLensClick,
                    focusRequester = searchFocusRequester
                )

                // Asynchronous query suggestions dropdown
                if (suggestions.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(6.dp))
                    com.example.ui.components.SearchSuggestionsDropdown(
                        suggestions = suggestions,
                        onSelectSuggestion = onSelectSuggestion
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Language Pills (All · English · हिंदी)
        LanguagePillRow(
            selectedFilter = selectedFilter,
            onFilterSelect = onFilterSelect
        )

        // Local-only Search History Section (Last 5 Room items)
        if (recentSearches.isNotEmpty() && query.isBlank()) {
            Spacer(modifier = Modifier.height(24.dp))
            com.example.ui.components.RecentSearchesSection(
                recentSearches = recentSearches,
                onSelectQuery = { selectedQ ->
                    onQueryChange(selectedQ)
                    onSearchSubmit(selectedQ)
                },
                onDeleteQuery = onDeleteRecentQuery,
                onClearAll = onClearRecentSearches
            )
        }

        Spacer(modifier = Modifier.height(30.dp))

        // Trending Queries Section
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp)
        ) {
            Icon(
                imageVector = Icons.Default.TrendingUp,
                contentDescription = null,
                tint = colors.accentTeal,
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = "Trending in India",
                style = MaterialTheme.typography.labelMedium,
                color = colors.inkMuted,
                fontWeight = FontWeight.SemiBold
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        FlowRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            trendingQueries.forEach { chipQuery ->
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(colors.surface)
                        .border(1.dp, colors.border, RoundedCornerShape(16.dp))
                        .clickable {
                            onQueryChange(chipQuery)
                            onSearchSubmit(chipQuery)
                        }
                        .padding(horizontal = 12.dp, vertical = 7.dp)
                        .testTag("trending_chip_$chipQuery")
                ) {
                    Text(
                        text = chipQuery,
                        style = MaterialTheme.typography.bodySmall,
                        color = colors.ink,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(48.dp))

        // Trust Line per PRD & Mockup
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .clip(RoundedCornerShape(20.dp))
                .background(colors.accentTeal.copy(alpha = 0.08f))
                .border(1.dp, colors.accentTeal.copy(alpha = 0.2f), RoundedCornerShape(20.dp))
                .padding(horizontal = 14.dp, vertical = 8.dp)
        ) {
            Icon(
                imageVector = Icons.Outlined.Shield,
                contentDescription = null,
                tint = colors.accentTeal,
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Private by design · No profiling · Grounded AI answers",
                style = MaterialTheme.typography.labelSmall,
                color = colors.accentTeal,
                fontWeight = FontWeight.SemiBold
            )
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Footer links (About · Privacy · Bangs · Settings)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "About",
                style = MaterialTheme.typography.labelSmall,
                color = colors.inkMuted,
                modifier = Modifier.clickable { onOpenAbout() }.padding(6.dp)
            )
            Text(text = "·", color = colors.border, modifier = Modifier.padding(horizontal = 4.dp))
            Text(
                text = "Privacy",
                style = MaterialTheme.typography.labelSmall,
                color = colors.inkMuted,
                modifier = Modifier.clickable { onOpenPrivacy() }.padding(6.dp)
            )
            Text(text = "·", color = colors.border, modifier = Modifier.padding(horizontal = 4.dp))
            Text(
                text = "!Bangs",
                style = MaterialTheme.typography.labelSmall,
                color = colors.inkMuted,
                modifier = Modifier.clickable { onOpenBangs() }.padding(6.dp)
            )
            Text(text = "·", color = colors.border, modifier = Modifier.padding(horizontal = 4.dp))
            Text(
                text = "Settings",
                style = MaterialTheme.typography.labelSmall,
                color = colors.inkMuted,
                modifier = Modifier.clickable { onOpenSettings() }.padding(6.dp)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}
}
