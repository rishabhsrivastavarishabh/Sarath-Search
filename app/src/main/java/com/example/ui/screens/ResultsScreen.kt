package com.example.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.SearchOff
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.outlined.BugReport
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.BangMatch
import com.example.ui.LanguageFilter
import com.example.ui.SearchTab
import com.example.ui.SearchUiState
import com.example.ui.components.AIAnswerCard
import com.example.ui.components.AiOverviewSkeletonCard
import com.example.ui.components.DefaultErrorFallback
import com.example.ui.components.ErrorBoundary
import com.example.ui.components.ImagesResultView
import com.example.ui.components.LanguagePillRow
import com.example.ui.components.NewsResultView
import com.example.ui.components.OrganicResultCard
import com.example.ui.components.OrganicResultsSkeleton
import com.example.ui.components.SearchInputBox
import com.example.ui.components.SearchSuggestionsDropdown
import com.example.ui.components.SearchTabBar
import com.example.ui.components.WheelSpokeMark
import com.example.ui.theme.LocalSarathColors
import java.net.URLEncoder

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ResultsScreen(
    uiState: SearchUiState,
    onQueryChange: (String) -> Unit,
    onSearchSubmit: (String?) -> Unit,
    onSelectSuggestion: (String) -> Unit = {},
    onGoHome: () -> Unit,
    onFilterSelect: (LanguageFilter) -> Unit,
    onTabSelect: (SearchTab) -> Unit,
    onOpenUrl: (String) -> Unit,
    onToggleDebugView: () -> Unit,
    onFeedback: (String, Boolean) -> Unit,
    onDismissBang: () -> Unit,
    onVoiceClick: () -> Unit,
    onLensClick: () -> Unit
) {
    val colors = LocalSarathColors.current
    val context = LocalContext.current
    val searchFocusRequester = remember { FocusRequester() }
    val rootFocusRequester = remember { FocusRequester() }

    LaunchedEffect(Unit) {
        rootFocusRequester.requestFocus()
    }

    // Share Search URL via Android ShareSheet
    val shareCurrentSearchUrl = {
        val encodedQuery = try {
            URLEncoder.encode(uiState.activeQuery, "UTF-8")
        } catch (_: Exception) {
            uiState.activeQuery
        }
        val searchUrl = "https://sarath.in/search?q=$encodedQuery"
        val sendIntent = Intent(Intent.ACTION_SEND).apply {
            putExtra(Intent.EXTRA_TEXT, searchUrl)
            putExtra(Intent.EXTRA_SUBJECT, "Sarath Search: ${uiState.activeQuery}")
            type = "text/plain"
        }
        context.startActivity(Intent.createChooser(sendIntent, "Share Search URL"))
    }

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
                            if (uiState.query.isNotEmpty()) {
                                onQueryChange("")
                            } else {
                                onGoHome()
                            }
                            true
                        }
                        else -> false
                    }
                } else {
                    false
                }
            }
            .background(colors.bg)
            .statusBarsPadding()
    ) {
        // Compact Top Bar with Wheel Mark, Input Box, Share Search Button, Debug Toggle
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(colors.surface)
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Home / Logo button
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .clickable { onGoHome() }
                    .padding(4.dp)
                    .testTag("nav_home_button"),
                verticalAlignment = Alignment.CenterVertically
            ) {
                WheelSpokeMark(size = 32.dp, isSpinning = uiState.isSearching)
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Search input box (Compact mode)
            Box(modifier = Modifier.weight(1f)) {
                SearchInputBox(
                    query = uiState.query,
                    onQueryChange = onQueryChange,
                    onSearchSubmit = { onSearchSubmit(null) },
                    isHero = false,
                    modifier = Modifier.fillMaxWidth(),
                    onVoiceClick = onVoiceClick,
                    onLensClick = onLensClick,
                    focusRequester = searchFocusRequester
                )
            }

            Spacer(modifier = Modifier.width(6.dp))

            // Share current Search URL button (uses Android ShareSheet)
            IconButton(
                onClick = shareCurrentSearchUrl,
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(colors.accentGold.copy(alpha = 0.12f))
                    .testTag("share_search_url_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Share,
                    contentDescription = "Share Current Search URL",
                    tint = colors.accentGold,
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(modifier = Modifier.width(4.dp))

            // Dev / Debug View Toggle
            IconButton(
                onClick = onToggleDebugView,
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(if (uiState.showDebugView) colors.accentGold.copy(alpha = 0.2f) else Color.Transparent)
                    .testTag("results_debug_toggle")
            ) {
                Icon(
                    imageVector = Icons.Outlined.BugReport,
                    contentDescription = "Debug View",
                    tint = if (uiState.showDebugView) colors.accentGold else colors.inkMuted,
                    modifier = Modifier.size(18.dp)
                )
            }
        }

        // Suggestions Dropdown overlay on ResultsScreen if typing query
        if (uiState.suggestions.isNotEmpty()) {
            Box(modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 4.dp)) {
                SearchSuggestionsDropdown(
                    suggestions = uiState.suggestions,
                    onSelectSuggestion = { sug ->
                        onSelectSuggestion(sug)
                    }
                )
            }
        }

        // Tabs Bar (All · Images · News)
        SearchTabBar(
            selectedTab = uiState.selectedTab,
            onTabSelect = onTabSelect
        )

        // Dev / Debug View Banner (when enabled)
        if (uiState.showDebugView) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(colors.accentGold.copy(alpha = 0.12f))
                    .border(1.dp, colors.accentGold.copy(alpha = 0.3f))
                    .padding(horizontal = 16.dp, vertical = 6.dp)
                    .testTag("dev_debug_banner")
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "DEV VIEW · Provider: ",
                                style = MaterialTheme.typography.labelSmall,
                                color = colors.accentGold,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = uiState.searchResponse?.provider ?: "chain pending",
                                style = MaterialTheme.typography.labelSmall,
                                color = colors.ink,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                        if (uiState.searchDurationMs != null) {
                            Text(
                                text = "Latency: ${uiState.searchDurationMs}ms | Count: ${uiState.searchResponse?.count ?: 0}",
                                style = MaterialTheme.typography.labelSmall,
                                color = colors.inkMuted,
                                fontSize = 10.sp
                            )
                        }
                    }

                    if (!uiState.searchResponse?.debug.isNullOrBlank()) {
                        Text(
                            text = "debug: ${uiState.searchResponse?.debug?.take(40)}...",
                            style = MaterialTheme.typography.labelSmall,
                            color = colors.inkMuted,
                            fontSize = 9.sp
                        )
                    }
                }
            }
        }

        // Bang Shortcut Notification Banner (if user typed !yt, !gh, etc.)
        val bang = uiState.bangDetected
        if (bang != null) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(colors.accentTeal.copy(alpha = 0.1f))
                    .border(1.dp, colors.accentTeal.copy(alpha = 0.25f))
                    .padding(horizontal = 14.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Bang shortcut '${bang.trigger}' detected for ${bang.targetName}",
                        style = MaterialTheme.typography.labelMedium,
                        color = colors.accentTeal,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "Open",
                        style = MaterialTheme.typography.labelMedium,
                        color = colors.accentTeal,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(colors.accentTeal.copy(alpha = 0.2f))
                            .clickable { onOpenUrl(bang.redirectUrl) }
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                    IconButton(onClick = onDismissBang, modifier = Modifier.size(24.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Dismiss", tint = colors.inkMuted, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }

        // Main Results Area
        when (uiState.selectedTab) {
            SearchTab.IMAGES -> {
                ImagesResultView(
                    images = uiState.imageResults,
                    isLoading = uiState.isImagesLoading,
                    onOpenUrl = onOpenUrl,
                    modifier = Modifier.weight(1f)
                )
            }
            SearchTab.NEWS -> {
                Column(modifier = Modifier.weight(1f)) {
                    // Language filter pills for news
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        LanguagePillRow(
                            selectedFilter = uiState.selectedLanguageFilter,
                            onFilterSelect = onFilterSelect
                        )
                    }

                    NewsResultView(
                        news = uiState.filteredNewsResults,
                        isLoading = uiState.isNewsLoading,
                        onOpenUrl = onOpenUrl,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            SearchTab.ALL -> {
                val results = uiState.filteredResults
                val hasResults = results.isNotEmpty()
                val isZeroResults = !uiState.isSearching && !hasResults && uiState.hasSearched
                val aiOverview = uiState.aiOverviewResponse
                val showAiCard = (aiOverview != null && aiOverview.shown) || (uiState.isAiLoading && uiState.isSearching)

                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp)
                        .semantics { liveRegion = LiveRegionMode.Polite }
                        .testTag("results_list"),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Language filter pills row (All · English · हिंदी)
                    item {
                        Spacer(modifier = Modifier.height(10.dp))
                        LanguagePillRow(
                            selectedFilter = uiState.selectedLanguageFilter,
                            onFilterSelect = onFilterSelect,
                            modifier = Modifier.testTag("language_filter_pill_row")
                        )
                    }

                    // Grounded AI Answer Card with Error Boundary & Skeleton
                    if (showAiCard) {
                        item {
                            ErrorBoundary(
                                componentName = "AI Overview",
                                onRetry = { onSearchSubmit(null) }
                            ) {
                                if (uiState.isAiLoading && (aiOverview == null || aiOverview.answer.isNullOrBlank())) {
                                    AiOverviewSkeletonCard()
                                } else {
                                    AIAnswerCard(
                                        aiResponse = aiOverview ?: com.example.data.model.AiOverviewResponse(),
                                        isStreamingOrLoading = uiState.isAiLoading,
                                        onOpenCitation = onOpenUrl
                                    )
                                }
                            }
                        }
                    }

                    // Skeleton loaders for organic results during initial fetch
                    if (uiState.isSearching && results.isEmpty()) {
                        item {
                            OrganicResultsSkeleton(count = 4)
                        }
                    } else if (uiState.isSearching) {
                        // Incremental loading banner when results are already partially showing
                        item {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 12.dp),
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    color = colors.accentTeal,
                                    strokeWidth = 2.dp
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = "Updating search providers...",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = colors.inkMuted
                                )
                            }
                        }
                    }

                    // Error state with ErrorBoundary fallback
                    if (uiState.errorMessage != null && results.isEmpty() && !uiState.isSearching) {
                        item {
                            DefaultErrorFallback(
                                componentName = "Search Results",
                                errorMessage = uiState.errorMessage,
                                onReset = { onSearchSubmit(null) }
                            )
                        }
                    }

                    // Zero Results State per App Flow doc §6
                    if (isZeroResults && uiState.errorMessage == null) {
                        item {
                            ZeroResultsView(
                                query = uiState.activeQuery,
                                onTrySuggestion = { suggestion: String ->
                                    onQueryChange(suggestion)
                                    onSearchSubmit(suggestion)
                                }
                            )
                        }
                    }

                    // Organic Results List wrapped with ErrorBoundary
                    items(results, key = { it.url }) { item: com.example.data.model.SearchResultItem ->
                        ErrorBoundary(
                            componentName = "Search Result",
                            onRetry = { onSearchSubmit(null) }
                        ) {
                            OrganicResultCard(
                                result = item,
                                isFeedbackGiven = uiState.feedbackGiven.contains(item.url),
                                onFeedback = { isThumbsUp -> onFeedback(item.url, isThumbsUp) },
                                onOpenUrl = onOpenUrl
                            )
                        }
                    }

                    // Bottom spacer
                    item {
                        Spacer(modifier = Modifier.height(36.dp))
                    }
                }
            }
        }
    }
}

/**
 * Zero results state following App Flow doc §6:
 * "No results for '<query>'. Try fewer or more general words, or check spelling."
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ZeroResultsView(
    query: String,
    onTrySuggestion: (String) -> Unit
) {
    val colors = LocalSarathColors.current

    val helpfulSuggestions = listOf(
        "UPI payment overview",
        "Vande Bharat routes",
        "सारथी ड्राइविंग लाइसेंस",
        "IRCTC train search"
    )

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 32.dp, horizontal = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(56.dp)
                .clip(CircleShape)
                .background(colors.accentGold.copy(alpha = 0.12f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.SearchOff,
                contentDescription = null,
                tint = colors.accentGold,
                modifier = Modifier.size(28.dp)
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        Text(
            text = "No results for '$query'",
            style = MaterialTheme.typography.titleLarge,
            color = colors.ink,
            fontFamily = FontFamily.Serif,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = "Try fewer or more general words, check spelling, or explore one of these popular Indian civic topics:",
            style = MaterialTheme.typography.bodyMedium,
            color = colors.inkMuted,
            textAlign = TextAlign.Center,
            lineHeight = 20.sp
        )

        Spacer(modifier = Modifier.height(18.dp))

        FlowRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            helpfulSuggestions.forEach { suggestion ->
                Box(
                    modifier = Modifier
                        .padding(horizontal = 4.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(colors.surface)
                        .border(1.dp, colors.accentTeal.copy(alpha = 0.4f), RoundedCornerShape(14.dp))
                        .clickable { onTrySuggestion(suggestion) }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = suggestion,
                        style = MaterialTheme.typography.bodySmall,
                        color = colors.accentTeal,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}
