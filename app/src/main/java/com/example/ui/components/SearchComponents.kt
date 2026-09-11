package com.example.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.remember
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Newspaper
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.ThumbDown
import androidx.compose.material.icons.filled.ThumbUp
import androidx.compose.material.icons.outlined.CenterFocusWeak
import androidx.compose.material.icons.outlined.Language
import androidx.compose.material.icons.outlined.Public
import androidx.compose.material.icons.outlined.ThumbDown
import androidx.compose.material.icons.outlined.ThumbUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.AiCitation
import com.example.data.model.AiOverviewResponse
import com.example.data.model.SearchResultItem
import com.example.ui.LanguageFilter
import com.example.ui.SearchTab
import com.example.ui.theme.LocalSarathColors
import com.example.ui.theme.SarathBadgeEn
import com.example.ui.theme.SarathBadgeHi

/**
 * Reusable Search Input Box supporting hero (home) and compact (top bar) sizing.
 */
@Composable
fun SearchInputBox(
    query: String,
    onQueryChange: (String) -> Unit,
    onSearchSubmit: () -> Unit,
    modifier: Modifier = Modifier,
    isHero: Boolean = false,
    placeholderText: String = "Search web, transit, civic services, or type !yt...",
    onVoiceClick: (() -> Unit)? = null,
    onLensClick: (() -> Unit)? = null,
    focusRequester: FocusRequester? = null
) {
    val colors = LocalSarathColors.current
    val effectiveFocusRequester = focusRequester ?: remember { FocusRequester() }

    OutlinedTextField(
        value = query,
        onValueChange = onQueryChange,
        modifier = modifier
            .fillMaxWidth()
            .focusRequester(effectiveFocusRequester)
            .testTag(if (isHero) "hero_search_input" else "compact_search_input"),
        placeholder = {
            Text(
                text = placeholderText,
                style = if (isHero) MaterialTheme.typography.bodyLarge else MaterialTheme.typography.bodyMedium,
                color = colors.inkMuted,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        },
        singleLine = true,
        textStyle = (if (isHero) MaterialTheme.typography.bodyLarge else MaterialTheme.typography.bodyMedium).copy(
            color = colors.ink,
            fontWeight = FontWeight.Medium
        ),
        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
        keyboardActions = KeyboardActions(onSearch = { onSearchSubmit() }),
        leadingIcon = {
            Icon(
                imageVector = Icons.Default.Search,
                contentDescription = "Search",
                tint = colors.accentGold,
                modifier = Modifier.size(if (isHero) 24.dp else 20.dp)
            )
        },
        trailingIcon = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (query.isNotEmpty()) {
                    IconButton(
                        onClick = { onQueryChange("") },
                        modifier = Modifier.size(if (isHero) 36.dp else 30.dp).testTag("clear_query_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Clear,
                            contentDescription = "Clear search",
                            tint = colors.inkMuted,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                } else {
                    // Keyboard shortcut hint for desktop users
                    Box(
                        modifier = Modifier
                            .padding(horizontal = 4.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .background(colors.border.copy(alpha = 0.5f))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                            .semantics { contentDescription = "Shortcut press slash to focus" }
                    ) {
                        Text(
                            text = "/",
                            style = MaterialTheme.typography.labelSmall,
                            color = colors.inkMuted,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Voice Search Button
                if (onVoiceClick != null) {
                    IconButton(
                        onClick = onVoiceClick,
                        modifier = Modifier.size(if (isHero) 38.dp else 30.dp).testTag("voice_search_icon_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Mic,
                            contentDescription = "Voice Search",
                            tint = colors.accentGold,
                            modifier = Modifier.size(if (isHero) 22.dp else 18.dp)
                        )
                    }
                }

                // Lens Search Button
                if (onLensClick != null) {
                    IconButton(
                        onClick = onLensClick,
                        modifier = Modifier.size(if (isHero) 38.dp else 30.dp).testTag("lens_search_icon_button")
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.CenterFocusWeak,
                            contentDescription = "Search with Lens",
                            tint = colors.accentTeal,
                            modifier = Modifier.size(if (isHero) 22.dp else 18.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.width(2.dp))

                Box(
                    modifier = Modifier
                        .padding(end = 4.dp)
                        .size(if (isHero) 40.dp else 32.dp)
                        .clip(CircleShape)
                        .background(colors.accentTeal)
                        .clickable { onSearchSubmit() }
                        .testTag("submit_search_button"),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "Execute Search",
                        tint = Color.White,
                        modifier = Modifier.size(if (isHero) 18.dp else 16.dp)
                    )
                }
            }
        },
        shape = RoundedCornerShape(if (isHero) 28.dp else 20.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedContainerColor = colors.surface,
            unfocusedContainerColor = colors.surface,
            focusedBorderColor = colors.accentGold,
            unfocusedBorderColor = colors.border,
            cursorColor = colors.accentGold
        )
    )
}

/**
 * Language filter pill bar (All · English · हिंदी)
 */
@Composable
fun LanguagePillRow(
    selectedFilter: LanguageFilter,
    onFilterSelect: (LanguageFilter) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalSarathColors.current

    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        LanguageFilterPill(
            label = "All Languages",
            isSelected = selectedFilter == LanguageFilter.ALL,
            onClick = { onFilterSelect(LanguageFilter.ALL) }
        )
        LanguageFilterPill(
            label = "English (EN)",
            badge = "EN",
            isSelected = selectedFilter == LanguageFilter.EN,
            onClick = { onFilterSelect(LanguageFilter.EN) }
        )
        LanguageFilterPill(
            label = "हिंदी (HI)",
            badge = "HI",
            isSelected = selectedFilter == LanguageFilter.HI,
            onClick = { onFilterSelect(LanguageFilter.HI) }
        )
    }
}

@Composable
fun LanguageFilterPill(
    label: String,
    badge: String? = null,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val colors = LocalSarathColors.current

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(
                if (isSelected) colors.accentTeal else colors.surface
            )
            .border(
                1.dp,
                if (isSelected) colors.accentTeal else colors.border,
                RoundedCornerShape(20.dp)
            )
            .clickable { onClick() }
            .padding(horizontal = 14.dp, vertical = 7.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (badge != null) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(if (isSelected) Color.White.copy(alpha = 0.25f) else colors.accentGold.copy(alpha = 0.2f))
                        .padding(horizontal = 5.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = badge,
                        style = MaterialTheme.typography.labelSmall,
                        color = if (isSelected) Color.White else colors.accentGold,
                        fontWeight = FontWeight.Bold,
                        fontSize = 10.sp
                    )
                }
                Spacer(modifier = Modifier.width(6.dp))
            }
            Text(
                text = label,
                style = MaterialTheme.typography.labelMedium,
                color = if (isSelected) Color.White else colors.ink,
                fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal
            )
        }
    }
}

/**
 * Result tabs (All, Images, News) with active indicator in teal
 */
@Composable
fun SearchTabBar(
    selectedTab: SearchTab,
    onTabSelect: (SearchTab) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalSarathColors.current
    val tabs = listOf(
        SearchTab.ALL to "All",
        SearchTab.IMAGES to "Images",
        SearchTab.NEWS to "News"
    )

    ScrollableTabRow(
        selectedTabIndex = selectedTab.ordinal,
        modifier = modifier.fillMaxWidth(),
        containerColor = colors.bg,
        contentColor = colors.accentTeal,
        edgePadding = 0.dp,
        indicator = { tabPositions ->
            TabRowDefaults.SecondaryIndicator(
                modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab.ordinal]),
                color = colors.accentTeal,
                height = 3.dp
            )
        },
        divider = {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(1.dp)
                    .background(colors.border)
            )
        }
    ) {
        tabs.forEach { (tab, title) ->
            val isSelected = selectedTab == tab
            Tab(
                selected = isSelected,
                onClick = { onTabSelect(tab) },
                text = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        when (tab) {
                            SearchTab.ALL -> Icon(Icons.Outlined.Public, contentDescription = null, modifier = Modifier.size(16.dp))
                            SearchTab.IMAGES -> Icon(Icons.Default.Image, contentDescription = null, modifier = Modifier.size(16.dp))
                            SearchTab.NEWS -> Icon(Icons.Default.Newspaper, contentDescription = null, modifier = Modifier.size(16.dp))
                        }
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = title,
                            style = MaterialTheme.typography.labelLarge,
                            color = if (isSelected) colors.accentTeal else colors.inkMuted,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                }
            )
        }
    }
}

/**
 * Grounded AI Answer Card (with gold left border, citation chips, and confidence indicator)
 */
@Composable
fun AIAnswerCard(
    aiResponse: AiOverviewResponse,
    isStreamingOrLoading: Boolean,
    onOpenCitation: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalSarathColors.current

    val percentVerified = if (aiResponse.confidence != null) "${(aiResponse.confidence * 100).toInt()} percent verified" else ""
    val screenReaderSummary = buildString {
        append("Sarath AI Grounded Answer. ")
        if (!aiResponse.answer.isNullOrBlank()) {
            append(aiResponse.answer)
            append(". ")
        }
        if (percentVerified.isNotEmpty()) {
            append("Confidence ")
            append(percentVerified)
            append(". ")
        }
        val count = aiResponse.citations?.size ?: 0
        if (count > 0) {
            append("$count cited web sources.")
        }
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .border(1.dp, colors.accentGold.copy(alpha = 0.35f), RoundedCornerShape(14.dp))
            .semantics {
                heading()
                contentDescription = screenReaderSummary
            }
            .testTag("ai_answer_card"),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = colors.aiCardTint)
    ) {
        Row(modifier = Modifier.fillMaxWidth()) {
            // Gold Left Accent Border
            Box(
                modifier = Modifier
                    .width(5.dp)
                    .background(colors.accentGold)
            )

            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(16.dp)
            ) {
                // Header badge
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        WheelSpokeMark(size = 22.dp, isSpinning = isStreamingOrLoading)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Sarath AI Answer",
                            style = MaterialTheme.typography.labelLarge,
                            color = colors.accentGold,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Serif
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(colors.accentGold.copy(alpha = 0.15f))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "Grounded OM2.5",
                                style = MaterialTheme.typography.labelSmall,
                                color = colors.accentGold,
                                fontSize = 10.sp
                            )
                        }
                    }

                    if (aiResponse.confidence != null) {
                        val percent = (aiResponse.confidence * 100).toInt()
                        Text(
                            text = "$percent% verified",
                            style = MaterialTheme.typography.labelSmall,
                            color = colors.accentTeal,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                if (isStreamingOrLoading && aiResponse.answer == null) {
                    Text(
                        text = "Synthesizing verified web sources...",
                        style = MaterialTheme.typography.bodyMedium,
                        color = colors.inkMuted,
                        fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                    )
                } else if (!aiResponse.answer.isNullOrBlank()) {
                    Text(
                        text = aiResponse.answer,
                        style = MaterialTheme.typography.bodyLarge,
                        color = colors.ink,
                        lineHeight = 23.sp
                    )

                    // Citation Chips
                    val citations = aiResponse.citations
                    if (!citations.isNullOrEmpty()) {
                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            text = "Cited Sources:",
                            style = MaterialTheme.typography.labelSmall,
                            color = colors.inkMuted,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            citations.take(4).forEach { cit ->
                                CitationChip(citation = cit, onClick = { onOpenCitation(cit.url) })
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CitationChip(
    citation: AiCitation,
    onClick: () -> Unit
) {
    val colors = LocalSarathColors.current

    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(colors.surface)
            .border(1.dp, colors.border, RoundedCornerShape(8.dp))
            .clickable { onClick() }
            .semantics {
                role = Role.Button
                contentDescription = "Citation ${citation.n}: ${citation.domain ?: "Source"}. Double tap to open source link."
            }
            .padding(horizontal = 8.dp, vertical = 5.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .clip(CircleShape)
                .background(colors.accentGold.copy(alpha = 0.2f))
                .size(18.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "${citation.n}",
                style = MaterialTheme.typography.labelSmall,
                color = colors.accentGold,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold
            )
        }
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = citation.domain ?: "Source",
            style = MaterialTheme.typography.labelSmall,
            color = colors.accentTeal,
            fontWeight = FontWeight.Medium,
            maxLines = 1
        )
        if (citation.lang != null) {
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = "• ${citation.lang}",
                style = MaterialTheme.typography.labelSmall,
                color = colors.inkMuted,
                fontSize = 10.sp
            )
        }
    }
}

/**
 * Organic Search Result Card
 * With domain breadcrumb, server-provided EN/HI badge, teal title, and 15sp snippet with 1.5 line height.
 */
@Composable
fun OrganicResultCard(
    result: SearchResultItem,
    isFeedbackGiven: Boolean,
    onFeedback: (Boolean) -> Unit,
    onOpenUrl: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalSarathColors.current
    val context = LocalContext.current

    val isHindi = (result.lang?.uppercase() ?: "EN") == "HI"
    val accessibilityLabel = buildString {
        append("Search Result: ")
        append(result.title)
        append(". Source domain: ")
        append(result.domain ?: result.source ?: "web")
        append(". Language: ")
        append(if (isHindi) "Hindi" else "English")
        if (!result.snippet.isNullOrBlank()) {
            append(". Snippet: ")
            append(result.snippet)
        }
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .border(1.dp, colors.border, RoundedCornerShape(12.dp))
            .testTag("result_card_${result.url.hashCode()}"),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = colors.surface)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Top Breadcrumb + Language Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f, fill = false)) {
                    // Small domain icon dot
                    Box(
                        modifier = Modifier
                            .size(18.dp)
                            .clip(CircleShape)
                            .background(colors.accentTeal.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = result.domain?.take(1)?.uppercase() ?: "W",
                            style = MaterialTheme.typography.labelSmall,
                            color = colors.accentTeal,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = result.domain ?: result.source ?: "web",
                        style = MaterialTheme.typography.labelSmall,
                        color = colors.inkMuted,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                // Server-computed Language Badge (EN / HI)
                val lang = result.lang?.uppercase() ?: "EN"
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(if (isHindi) SarathBadgeHi.copy(alpha = 0.15f) else SarathBadgeEn.copy(alpha = 0.15f))
                        .padding(horizontal = 7.dp, vertical = 2.dp)
                        .semantics {
                            contentDescription = if (isHindi) "Language: Hindi" else "Language: English"
                        }
                ) {
                    Text(
                        text = if (isHindi) "HI · हिंदी" else "EN · English",
                        style = MaterialTheme.typography.labelSmall,
                        color = if (isHindi) SarathBadgeHi else SarathBadgeEn,
                        fontWeight = FontWeight.Bold,
                        fontSize = 10.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Title in Teal Accent (Clickable)
            Text(
                text = result.title,
                style = MaterialTheme.typography.titleLarge,
                color = colors.accentTeal,
                fontWeight = FontWeight.SemiBold,
                lineHeight = 22.sp,
                modifier = Modifier
                    .clickable { onOpenUrl(result.url) }
                    .semantics {
                        heading()
                        role = Role.Button
                        contentDescription = "$accessibilityLabel. Double tap to open article."
                    }
                    .testTag("result_title_${result.url.hashCode()}")
            )

            // Snippet with 15sp base font and 1.5 line height (22sp) per spec
            if (!result.snippet.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = result.snippet,
                    style = MaterialTheme.typography.bodyLarge,
                    color = colors.inkMuted,
                    lineHeight = 22.sp
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Action Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Open URL button
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .clickable { onOpenUrl(result.url) }
                            .semantics {
                                role = Role.Button
                                contentDescription = "Visit article at ${result.domain ?: result.url}"
                            }
                            .padding(horizontal = 6.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.OpenInNew,
                            contentDescription = null,
                            tint = colors.accentTeal,
                            modifier = Modifier.size(15.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Visit",
                            style = MaterialTheme.typography.labelSmall,
                            color = colors.accentTeal,
                            fontWeight = FontWeight.SemiBold
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    // Copy Link
                    IconButton(
                        onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            clipboard.setPrimaryClip(ClipData.newPlainText("URL", result.url))
                            Toast.makeText(context, "URL copied to clipboard", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ContentCopy,
                            contentDescription = "Copy Link for ${result.title}",
                            tint = colors.inkMuted,
                            modifier = Modifier.size(15.dp)
                        )
                    }

                    // Share Link
                    IconButton(
                        onClick = {
                            val sendIntent = Intent().apply {
                                action = Intent.ACTION_SEND
                                putExtra(Intent.EXTRA_TEXT, "${result.title}\n${result.url}")
                                type = "text/plain"
                            }
                            context.startActivity(Intent.createChooser(sendIntent, "Share Result"))
                        },
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = "Share Link for ${result.title}",
                            tint = colors.inkMuted,
                            modifier = Modifier.size(15.dp)
                        )
                    }
                }

                // Feedback Thumbs
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = {
                            onFeedback(true)
                            Toast.makeText(context, "Thank you for the feedback!", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            imageVector = if (isFeedbackGiven) Icons.Filled.ThumbUp else Icons.Outlined.ThumbUp,
                            contentDescription = "Mark ${result.title} as helpful",
                            tint = if (isFeedbackGiven) colors.accentTeal else colors.inkMuted,
                            modifier = Modifier.size(15.dp)
                        )
                    }
                    IconButton(
                        onClick = {
                            onFeedback(false)
                            Toast.makeText(context, "Reported. We'll tune ranking.", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.ThumbDown,
                            contentDescription = "Mark ${result.title} as not helpful",
                            tint = colors.inkMuted,
                            modifier = Modifier.size(15.dp)
                        )
                    }
                }
            }
        }
    }
}

/**
 * Honest "Coming Soon" Empty State for Images and News tabs per Requirement 4.
 */
@Composable
fun TabComingSoonView(
    tabName: String,
    modifier: Modifier = Modifier
) {
    val colors = LocalSarathColors.current

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .clip(CircleShape)
                .background(colors.accentGold.copy(alpha = 0.12f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = if (tabName == "Images") Icons.Default.Image else Icons.Default.Newspaper,
                contentDescription = null,
                tint = colors.accentGold,
                modifier = Modifier.size(32.dp)
            )
        }
        Spacer(modifier = Modifier.height(14.dp))
        Text(
            text = "$tabName tab is coming soon",
            style = MaterialTheme.typography.titleLarge,
            color = colors.ink,
            fontFamily = FontFamily.Serif
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = "We are currently tuning our India-first $tabName index pipeline. Rather than showing fabricated results, we are polishing our native crawling and licensing sources.",
            style = MaterialTheme.typography.bodyMedium,
            color = colors.inkMuted,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
            lineHeight = 20.sp
        )
    }
}
