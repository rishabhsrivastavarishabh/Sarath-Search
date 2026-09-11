package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.BugReport
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.DEFAULT_BANGS
import com.example.ui.theme.LocalSarathColors

@Composable
fun BangsDialog(
    onDismiss: () -> Unit,
    onSelectBang: (String) -> Unit
) {
    val colors = LocalSarathColors.current

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                WheelSpokeMark(size = 28.dp)
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = "Bangs Shortcuts",
                    style = MaterialTheme.typography.titleLarge,
                    color = colors.ink,
                    fontFamily = FontFamily.Serif
                )
            }
        },
        text = {
            Column {
                Text(
                    text = "Type any bang shortcut in the search bar to jump directly to external search results. Tap one to try:",
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.inkMuted,
                    lineHeight = 20.sp
                )
                Spacer(modifier = Modifier.height(14.dp))
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(300.dp)
                ) {
                    items(DEFAULT_BANGS) { bang ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(colors.surface)
                                .border(1.dp, colors.border, RoundedCornerShape(8.dp))
                                .clickable { onSelectBang(bang.trigger) }
                                .padding(horizontal = 12.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(colors.accentGold.copy(alpha = 0.15f))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = bang.trigger,
                                        style = MaterialTheme.typography.labelSmall,
                                        color = colors.accentGold,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = bang.name,
                                    style = MaterialTheme.typography.titleMedium,
                                    color = colors.ink,
                                    fontSize = 14.sp
                                )
                            }
                            Text(
                                text = bang.category,
                                style = MaterialTheme.typography.labelSmall,
                                color = colors.inkMuted
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss, modifier = Modifier.testTag("dismiss_bangs_button")) {
                Text("Close", color = colors.accentTeal)
            }
        },
        containerColor = colors.surface
    )
}

@Composable
fun SettingsDialog(
    safeSearchEnabled: Boolean,
    onSafeSearchChange: (Boolean) -> Unit,
    regionBias: String,
    onRegionBiasChange: (String) -> Unit,
    isDarkMode: Boolean,
    onToggleTheme: () -> Unit,
    showDebugView: Boolean,
    onToggleDebugView: () -> Unit,
    onSelectBang: ((String) -> Unit)? = null,
    onClearHistory: (() -> Unit)? = null,
    onDismiss: () -> Unit
) {
    val colors = LocalSarathColors.current
    var showBangsSubSection by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = null,
                    tint = colors.accentTeal,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Preferences & Settings",
                    style = MaterialTheme.typography.titleLarge,
                    color = colors.ink,
                    fontFamily = FontFamily.Serif
                )
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
            ) {
                // Theme Selection
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Appearance & Theme",
                            style = MaterialTheme.typography.titleMedium,
                            color = colors.ink,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = if (isDarkMode) "Dark mode active" else "Warm light mode active",
                            style = MaterialTheme.typography.bodySmall,
                            color = colors.inkMuted
                        )
                    }
                    IconButton(
                        onClick = onToggleTheme,
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(colors.accentGold.copy(alpha = 0.15f))
                            .testTag("theme_toggle_button")
                    ) {
                        Icon(
                            imageVector = if (isDarkMode) Icons.Default.LightMode else Icons.Default.DarkMode,
                            contentDescription = "Toggle Dark or Light Theme",
                            tint = colors.accentGold
                        )
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = colors.border)

                // Bangs Shortcuts Directory
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { showBangsSubSection = !showBangsSubSection }
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "Bangs & Shortcuts",
                                    style = MaterialTheme.typography.titleMedium,
                                    color = colors.ink,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(colors.accentGold.copy(alpha = 0.15f))
                                        .padding(horizontal = 5.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "${DEFAULT_BANGS.size} available",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = colors.accentGold,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                            Text(
                                text = "Instant redirection shortcuts like !w, !yt, !gh",
                                style = MaterialTheme.typography.bodySmall,
                                color = colors.inkMuted
                            )
                        }

                        Icon(
                            imageVector = if (showBangsSubSection) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                            contentDescription = "Toggle Bangs",
                            tint = colors.inkMuted
                        )
                    }

                    AnimatedVisibility(visible = showBangsSubSection) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 8.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(colors.bg)
                                .padding(8.dp)
                        ) {
                            DEFAULT_BANGS.forEach { bang ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            onSelectBang?.invoke(bang.trigger + " ")
                                            onDismiss()
                                        }
                                        .padding(vertical = 6.dp, horizontal = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = bang.trigger,
                                            style = MaterialTheme.typography.labelLarge,
                                            color = colors.accentTeal,
                                            fontFamily = FontFamily.Monospace,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Spacer(modifier = Modifier.width(10.dp))
                                        Text(
                                            text = bang.name,
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = colors.ink,
                                            fontSize = 13.sp
                                        )
                                    }
                                    Text(
                                        text = "Insert",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = colors.accentGold,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = colors.border)

                // Safe Search
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "SafeSearch Filter",
                            style = MaterialTheme.typography.titleMedium,
                            color = colors.ink,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "Filter explicit web and media content",
                            style = MaterialTheme.typography.bodySmall,
                            color = colors.inkMuted
                        )
                    }
                    Switch(
                        checked = safeSearchEnabled,
                        onCheckedChange = onSafeSearchChange,
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = colors.accentTeal,
                            checkedTrackColor = colors.accentTeal.copy(alpha = 0.3f)
                        )
                    )
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = colors.border)

                // Region / Language weighting
                Text(
                    text = "Relevance Weighting",
                    style = MaterialTheme.typography.titleMedium,
                    color = colors.ink,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    val isIndia = regionBias == "in"
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isIndia) colors.accentTeal.copy(alpha = 0.15f) else colors.surface)
                            .border(1.dp, if (isIndia) colors.accentTeal else colors.border, RoundedCornerShape(8.dp))
                            .clickable { onRegionBiasChange("in") }
                            .padding(8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "India / Hindi First",
                            style = MaterialTheme.typography.labelMedium,
                            color = if (isIndia) colors.accentTeal else colors.inkMuted,
                            fontWeight = if (isIndia) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (!isIndia) colors.accentTeal.copy(alpha = 0.15f) else colors.surface)
                            .border(1.dp, if (!isIndia) colors.accentTeal else colors.border, RoundedCornerShape(8.dp))
                            .clickable { onRegionBiasChange("global") }
                            .padding(8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Global Default",
                            style = MaterialTheme.typography.labelMedium,
                            color = if (!isIndia) colors.accentTeal else colors.inkMuted,
                            fontWeight = if (!isIndia) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                }

                if (onClearHistory != null) {
                    HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = colors.border)

                    // Clear local history
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Search History (Room)",
                                style = MaterialTheme.typography.titleMedium,
                                color = colors.ink,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "Stored only on device (max 5 queries)",
                                style = MaterialTheme.typography.bodySmall,
                                color = colors.inkMuted
                            )
                        }
                        TextButton(
                            onClick = {
                                onClearHistory()
                                onDismiss()
                            }
                        ) {
                            Text("Clear", color = colors.accentTeal, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = colors.border)

                // Dev/Debug View Toggle
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Dev / Provider Info",
                            style = MaterialTheme.typography.titleMedium,
                            color = colors.ink,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "Show search provider chain and latency",
                            style = MaterialTheme.typography.bodySmall,
                            color = colors.inkMuted
                        )
                    }
                    Switch(
                        checked = showDebugView,
                        onCheckedChange = { onToggleDebugView() },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = colors.accentGold,
                            checkedTrackColor = colors.accentGold.copy(alpha = 0.3f)
                        )
                    )
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss, modifier = Modifier.testTag("save_settings_button")) {
                Text("Done", color = colors.accentTeal, fontWeight = FontWeight.Bold)
            }
        },
        containerColor = colors.surface
    )
}

@Composable
fun PrivacyDialog(onDismiss: () -> Unit) {
    val colors = LocalSarathColors.current

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Outlined.Shield,
                    contentDescription = null,
                    tint = colors.accentTeal,
                    modifier = Modifier.size(26.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Privacy Commitment",
                    style = MaterialTheme.typography.titleLarge,
                    color = colors.ink,
                    fontFamily = FontFamily.Serif
                )
            }
        },
        text = {
            Column {
                Text(
                    text = "We don't build a profile of you. Here's exactly what we store, and for how long:",
                    style = MaterialTheme.typography.titleMedium,
                    color = colors.ink,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp
                )
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = "• Zero Accounts: You can search anonymously without logging in or signing up.\n" +
                            "• No Ad Tracking: We do not use third-party tracking cookies or ad profiling beacons.\n" +
                            "• In-Memory Session: Theme and filters persist only in app state for your session.\n" +
                            "• Aggregated Privacy: Search telemetry is logged in privacy-preserving aggregate counters without user identity or IP linking.\n" +
                            "• Grounded AI: AI answers cite verifiable web sources rather than hallucinating answers.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.inkMuted,
                    lineHeight = 22.sp
                )
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss, modifier = Modifier.testTag("close_privacy_button")) {
                Text("Understood", color = colors.accentTeal)
            }
        },
        containerColor = colors.surface
    )
}

@Composable
fun AboutDialog(onDismiss: () -> Unit) {
    val colors = LocalSarathColors.current

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                WheelSpokeMark(size = 32.dp)
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "Sarath Search",
                        style = MaterialTheme.typography.titleLarge,
                        color = colors.ink,
                        fontFamily = FontFamily.Serif
                    )
                    Text(
                        text = "सारथी · The Navigating Charioteer",
                        style = MaterialTheme.typography.labelSmall,
                        color = colors.accentGold
                    )
                }
            }
        },
        text = {
            Column {
                Text(
                    text = "Sarathi is Sanskrit/Hindi for charioteer — the one who navigates and knows the way through the noise to a destination.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.ink,
                    lineHeight = 20.sp
                )
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = "Sarath Search is an India-first, private search engine combining meta-search breadth with grounded AI answers. Built to serve bilingual queries in English, Hindi, and Hinglish with zero tracking.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.inkMuted,
                    lineHeight = 20.sp
                )
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close", color = colors.accentTeal)
            }
        },
        containerColor = colors.surface
    )
}
