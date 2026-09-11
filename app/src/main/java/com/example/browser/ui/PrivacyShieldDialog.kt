package com.example.browser.ui

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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.outlined.Fingerprint
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material.icons.outlined.Tune
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.browser.engine.PrivacyEngine
import com.example.browser.model.BrowserTab
import com.example.ui.theme.LocalSarathColors

/**
 * Modern Website Privacy Report Dialog
 */
@Composable
fun PrivacyShieldDialog(
    tab: BrowserTab,
    trackerBlockerEnabled: Boolean,
    onToggleTrackerBlocker: () -> Unit,
    adBlockerEnabled: Boolean,
    onToggleAdBlocker: () -> Unit,
    cookieProtectionEnabled: Boolean,
    onToggleCookieProtection: () -> Unit,
    fingerprintProtectionEnabled: Boolean,
    onToggleFingerprintProtection: () -> Unit,
    onToggleWhitelist: () -> Unit,
    onOpenSitePermissions: () -> Unit,
    onDismiss: () -> Unit
) {
    val colors = LocalSarathColors.current
    val domain = PrivacyEngine.extractDomain(tab.url)

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(if (tab.isWhitelisted) colors.border else colors.accentTeal.copy(alpha = 0.18f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Shield,
                            contentDescription = null,
                            tint = if (tab.isWhitelisted) colors.inkMuted else colors.accentTeal,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "Website Privacy Report",
                            style = MaterialTheme.typography.titleMedium,
                            color = colors.ink,
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = domain,
                            style = MaterialTheme.typography.bodySmall,
                            color = colors.accentGold,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
                IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = colors.inkMuted)
                }
            }
        },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                // Live metrics overview box
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(colors.surface)
                        .border(1.dp, colors.border, RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Trackers blocked:", style = MaterialTheme.typography.bodyMedium, color = colors.inkMuted)
                            Text(
                                text = "${tab.blockedTrackersCount}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = colors.accentTeal,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Ads blocked:", style = MaterialTheme.typography.bodyMedium, color = colors.inkMuted)
                            Text(
                                text = "${tab.blockedAdsCount}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = colors.accentGold,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Third-party cookies blocked:", style = MaterialTheme.typography.bodyMedium, color = colors.inkMuted)
                            Text(
                                text = "${tab.blockedCookiesCount}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = colors.ink,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Fingerprinting attempts blocked:", style = MaterialTheme.typography.bodyMedium, color = colors.inkMuted)
                            Text(
                                text = "${tab.fingerprintAttemptsCount}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = colors.accentTeal,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Connection Security:", style = MaterialTheme.typography.bodyMedium, color = colors.inkMuted)
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = if (tab.isSecureHttps) Icons.Default.Lock else Icons.Default.Warning,
                                    contentDescription = null,
                                    tint = if (tab.isSecureHttps) Color(0xFF2E7D32) else Color(0xFFC62828),
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = if (tab.isSecureHttps) "HTTPS Secure" else "HTTP Insecure",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = if (tab.isSecureHttps) Color(0xFF2E7D32) else Color(0xFFC62828),
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "Controls & Shield Overrides",
                    style = MaterialTheme.typography.labelMedium,
                    color = colors.ink,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Whitelist toggle
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (tab.isWhitelisted) colors.accentGold.copy(alpha = 0.15f) else colors.bg)
                        .clickable { onToggleWhitelist() }
                        .padding(horizontal = 10.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = if (tab.isWhitelisted) "Website Whitelisted" else "Shields Active on this Site",
                            style = MaterialTheme.typography.bodyMedium,
                            color = colors.ink,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = if (tab.isWhitelisted) "Protections paused for compatibility" else "Tap to pause shields if site breaks",
                            style = MaterialTheme.typography.bodySmall,
                            color = colors.inkMuted,
                            fontSize = 11.sp
                        )
                    }
                    Switch(
                        checked = !tab.isWhitelisted,
                        onCheckedChange = { onToggleWhitelist() },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = colors.accentTeal,
                            checkedTrackColor = colors.accentTeal.copy(alpha = 0.35f)
                        )
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Individual Toggles
                ShieldControlRow("Block Trackers", trackerBlockerEnabled, onToggleTrackerBlocker)
                ShieldControlRow("Block Ads", adBlockerEnabled, onToggleAdBlocker)
                ShieldControlRow("Block Third-Party Cookies", cookieProtectionEnabled, onToggleCookieProtection)
                ShieldControlRow("Fingerprint Protection", fingerprintProtectionEnabled, onToggleFingerprintProtection)

                Spacer(modifier = Modifier.height(8.dp))

                // Site Permissions Action
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(colors.surface)
                        .border(1.dp, colors.border, RoundedCornerShape(8.dp))
                        .clickable { onOpenSitePermissions() }
                        .padding(horizontal = 12.dp, vertical = 10.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Outlined.Tune, contentDescription = null, tint = colors.accentGold, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Site Permissions", style = MaterialTheme.typography.bodyMedium, color = colors.ink, fontWeight = FontWeight.SemiBold)
                        }
                        Text("Configure >", style = MaterialTheme.typography.labelSmall, color = colors.accentGold, fontWeight = FontWeight.Bold)
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss, modifier = Modifier.testTag("close_privacy_report_button")) {
                Text("Done", color = colors.accentTeal, fontWeight = FontWeight.Bold)
            }
        },
        containerColor = colors.bg
    )
}

@Composable
private fun ShieldControlRow(
    label: String,
    checked: Boolean,
    onCheckedChange: () -> Unit
) {
    val colors = LocalSarathColors.current
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, style = MaterialTheme.typography.bodyMedium, color = colors.ink)
        Switch(
            checked = checked,
            onCheckedChange = { onCheckedChange() },
            colors = SwitchDefaults.colors(
                checkedThumbColor = colors.accentTeal,
                checkedTrackColor = colors.accentTeal.copy(alpha = 0.35f)
            )
        )
    }
}
