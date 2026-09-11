package com.example.browser.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.outlined.Fingerprint
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material.icons.outlined.Storage
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
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
import com.example.browser.model.BrowserTab
import com.example.ui.theme.LocalSarathColors

/**
 * Modern Privacy Dashboard Dialog displaying holistic metrics, security score, and cleanup controls
 */
@Composable
fun PrivacyDashboardDialog(
    privacyScore: Int,
    totalTrackersBlocked: Int,
    totalAdsBlocked: Int,
    totalCookiesBlocked: Int,
    httpsEnabled: Boolean,
    fingerprintProtectionEnabled: Boolean,
    onClearAllBrowsingData: () -> Unit,
    onDismiss: () -> Unit
) {
    val colors = LocalSarathColors.current

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(colors.accentTeal.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Shield,
                        contentDescription = null,
                        tint = colors.accentTeal,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "Privacy Dashboard",
                        style = MaterialTheme.typography.titleLarge,
                        color = colors.ink,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Real-time device protection & telemetry",
                        style = MaterialTheme.typography.bodySmall,
                        color = colors.inkMuted,
                        fontSize = 11.sp
                    )
                }
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Privacy Score Hero Card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(colors.accentTeal.copy(alpha = 0.12f))
                        .border(1.dp, colors.accentTeal.copy(alpha = 0.35f), RoundedCornerShape(14.dp))
                        .padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(
                                text = "Privacy Score",
                                style = MaterialTheme.typography.labelMedium,
                                color = colors.inkMuted,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Row(verticalAlignment = Alignment.Bottom) {
                                Text(
                                    text = "$privacyScore",
                                    style = MaterialTheme.typography.displayMedium,
                                    color = colors.accentTeal,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 36.sp
                                )
                                Text(
                                    text = " / 100",
                                    style = MaterialTheme.typography.titleMedium,
                                    color = colors.inkMuted,
                                    modifier = Modifier.padding(bottom = 6.dp)
                                )
                            }
                            Text(
                                text = if (privacyScore >= 90) "Excellent Protection · Highly Private" else "Standard Protection",
                                style = MaterialTheme.typography.bodySmall,
                                color = colors.accentGold,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 11.sp
                            )
                        }

                        Box(
                            modifier = Modifier
                                .size(54.dp)
                                .clip(CircleShape)
                                .background(colors.accentTeal.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Shield,
                                contentDescription = null,
                                tint = colors.accentTeal,
                                modifier = Modifier.size(30.dp)
                            )
                        }
                    }
                }

                // Metrics Grid
                Text(
                    text = "Protection Statistics",
                    style = MaterialTheme.typography.labelLarge,
                    color = colors.ink,
                    fontWeight = FontWeight.Bold
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    MetricCard(
                        title = "Trackers",
                        value = "$totalTrackersBlocked",
                        subtitle = "Blocked",
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        title = "Ads",
                        value = "$totalAdsBlocked",
                        subtitle = "Filtered",
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        title = "Cookies",
                        value = "$totalCookiesBlocked",
                        subtitle = "Isolated",
                        modifier = Modifier.weight(1f)
                    )
                }

                // Status Breakdown List
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(colors.surface)
                        .border(1.dp, colors.border, RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        StatusRow(
                            label = "HTTPS Enforcement",
                            status = if (httpsEnabled) "Enabled (Secure)" else "Standard",
                            isPositive = httpsEnabled
                        )
                        HorizontalDivider(color = colors.border.copy(alpha = 0.5f))
                        StatusRow(
                            label = "Fingerprint Protection",
                            status = if (fingerprintProtectionEnabled) "Active (Canvas/WebGL noise)" else "Disabled",
                            isPositive = fingerprintProtectionEnabled
                        )
                        HorizontalDivider(color = colors.border.copy(alpha = 0.5f))
                        StatusRow(
                            label = "Site Storage Isolation",
                            status = "Strict Partitioning",
                            isPositive = true
                        )
                        HorizontalDivider(color = colors.border.copy(alpha = 0.5f))
                        StatusRow(
                            label = "WebRTC IP Leak Guard",
                            status = "Protected (No STUN leaks)",
                            isPositive = true
                        )
                    }
                }

                // Automatic Data Cleanup action
                FilledTonalButton(
                    onClick = {
                        onClearAllBrowsingData()
                        onDismiss()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("automatic_data_cleanup_button"),
                    colors = ButtonDefaults.filledTonalButtonColors(
                        containerColor = colors.accentGold.copy(alpha = 0.15f),
                        contentColor = colors.ink
                    ),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.DeleteSweep,
                            contentDescription = null,
                            tint = colors.accentGold,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Automatic Data Cleanup (Purge All Site Data)",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close", color = colors.accentTeal, fontWeight = FontWeight.Bold)
            }
        },
        containerColor = colors.bg
    )
}

@Composable
private fun MetricCard(
    title: String,
    value: String,
    subtitle: String,
    modifier: Modifier = Modifier
) {
    val colors = LocalSarathColors.current
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(colors.surface)
            .border(1.dp, colors.border, RoundedCornerShape(10.dp))
            .padding(10.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text = title, style = MaterialTheme.typography.bodySmall, color = colors.inkMuted, fontSize = 11.sp)
            Text(
                text = value,
                style = MaterialTheme.typography.titleLarge,
                color = colors.accentTeal,
                fontWeight = FontWeight.Bold
            )
            Text(text = subtitle, style = MaterialTheme.typography.labelSmall, color = colors.accentGold, fontSize = 10.sp)
        }
    }
}

@Composable
private fun StatusRow(
    label: String,
    status: String,
    isPositive: Boolean
) {
    val colors = LocalSarathColors.current
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, style = MaterialTheme.typography.bodySmall, color = colors.ink)
        Text(
            text = status,
            style = MaterialTheme.typography.labelSmall,
            color = if (isPositive) Color(0xFF2E7D32) else colors.inkMuted,
            fontWeight = FontWeight.SemiBold
        )
    }
}
