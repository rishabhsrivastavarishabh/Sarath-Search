package com.example.browser.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.browser.engine.PrivacyEngine
import com.example.browser.model.BrowserProfile
import com.example.browser.model.BrowserTab
import com.example.ui.theme.LocalSarathColors

/**
 * Modern Tab Switcher with Container Tab isolation and Private Window support
 */
@Composable
fun TabSwitcherDialog(
    tabs: List<BrowserTab>,
    activeTabId: String,
    onSelectTab: (String) -> Unit,
    onCloseTab: (String) -> Unit,
    onNewTab: (BrowserProfile) -> Unit,
    onCloseAllTabs: () -> Unit,
    onDismiss: () -> Unit
) {
    val colors = LocalSarathColors.current

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .background(colors.bg),
            color = colors.bg
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                // Top Action Bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "Open Tabs (${tabs.size})",
                            style = MaterialTheme.typography.titleLarge,
                            color = colors.ink,
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Isolated profiles & container tabs",
                            style = MaterialTheme.typography.bodySmall,
                            color = colors.inkMuted,
                            fontSize = 12.sp
                        )
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        TextButton(
                            onClick = {
                                onCloseAllTabs()
                                onDismiss()
                            },
                            modifier = Modifier.testTag("close_all_tabs_button")
                        ) {
                            Text("Close All", color = Color(0xFFC62828), fontSize = 13.sp)
                        }

                        IconButton(onClick = onDismiss, modifier = Modifier.size(36.dp)) {
                            Icon(Icons.Default.Close, contentDescription = "Close", tint = colors.ink)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Profile Selector / Fast Launch Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    BrowserProfile.values().forEach { profile ->
                        val isIncognito = profile == BrowserProfile.INCOGNITO
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isIncognito) Color(0xFF37474F).copy(alpha = 0.15f) else colors.surface)
                                .border(
                                    1.dp,
                                    if (isIncognito) Color(0xFF37474F) else profile.getColor().copy(alpha = 0.5f),
                                    RoundedCornerShape(8.dp)
                                )
                                .clickable {
                                    onNewTab(profile)
                                    onDismiss()
                                }
                                .padding(vertical = 8.dp, horizontal = 4.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = if (isIncognito) "🕶️ Private" else "+ ${profile.displayName}",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = if (isIncognito) colors.ink else profile.getColor(),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp,
                                    maxLines = 1
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Tabs Grid
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(tabs) { tab ->
                        val isActive = tab.id == activeTabId
                        val isPrivate = tab.isIncognito

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(160.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isPrivate) Color(0xFF1E2429) else colors.surface)
                                .border(
                                    width = if (isActive) 2.dp else 1.dp,
                                    color = if (isActive) colors.accentTeal else if (isPrivate) Color(0xFF455A64) else colors.border,
                                    shape = RoundedCornerShape(12.dp)
                                )
                                .clickable {
                                    onSelectTab(tab.id)
                                    onDismiss()
                                }
                                .padding(10.dp)
                        ) {
                            Column(modifier = Modifier.fillMaxSize()) {
                                // Tab Header
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    // Profile Badge
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .background(
                                                if (isPrivate) Color(0xFF37474F)
                                                else tab.profile.getColor().copy(alpha = 0.2f)
                                            )
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = tab.profile.displayName,
                                            style = MaterialTheme.typography.labelSmall,
                                            color = if (isPrivate) Color.White else tab.profile.getColor(),
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }

                                    IconButton(
                                        onClick = { onCloseTab(tab.id) },
                                        modifier = Modifier.size(24.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.Close,
                                            contentDescription = "Close Tab",
                                            tint = if (isPrivate) Color.White.copy(alpha = 0.7f) else colors.inkMuted,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                // Title
                                Text(
                                    text = tab.title,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = if (isPrivate) Color.White else colors.ink,
                                    fontWeight = FontWeight.Bold,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis
                                )

                                Spacer(modifier = Modifier.height(2.dp))

                                // Domain
                                Text(
                                    text = PrivacyEngine.extractDomain(tab.url),
                                    style = MaterialTheme.typography.bodySmall,
                                    color = if (isPrivate) Color.LightGray else colors.inkMuted,
                                    fontSize = 11.sp,
                                    maxLines = 1
                                )

                                Spacer(modifier = Modifier.weight(1f))

                                // Shields summary row
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            imageVector = Icons.Outlined.Shield,
                                            contentDescription = null,
                                            tint = colors.accentTeal,
                                            modifier = Modifier.size(12.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = "${tab.blockedTrackersCount + tab.blockedAdsCount} blocked",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = colors.accentTeal,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }

                                    if (tab.isSecureHttps) {
                                        Icon(
                                            imageVector = Icons.Default.Lock,
                                            contentDescription = "HTTPS",
                                            tint = Color(0xFF2E7D32),
                                            modifier = Modifier.size(12.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Bottom Primary Action
                Button(
                    onClick = {
                        onNewTab(BrowserProfile.PERSONAL)
                        onDismiss()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .testTag("tab_switcher_new_tab_button"),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colors.accentTeal,
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("New Tab", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
