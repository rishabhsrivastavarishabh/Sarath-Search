package com.example.browser.ui

import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
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
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.outlined.Dns
import androidx.compose.material.icons.outlined.Fingerprint
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Security
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material.icons.outlined.Tune
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.browser.engine.BrowserTabManager
import com.example.browser.engine.PrivacyEngine
import com.example.browser.model.SecureDnsProvider
import com.example.ui.components.requestSetAsDefaultBrowser
import com.example.ui.theme.LocalSarathColors

/**
 * Comprehensive Browser Privacy & Security Settings Dialog
 */
@Composable
fun BrowserSettingsDialog(
    tabManager: BrowserTabManager,
    onOpenPasswordVault: () -> Unit,
    onOpenPrivacyDashboard: () -> Unit,
    onDismiss: () -> Unit
) {
    val colors = LocalSarathColors.current
    val context = LocalContext.current

    val trackerBlocker by tabManager.trackerBlockerEnabled.collectAsState()
    val adBlocker by tabManager.adBlockerEnabled.collectAsState()
    val cookieProtection by tabManager.cookieProtectionEnabled.collectAsState()
    val fingerprintProtection by tabManager.fingerprintProtectionEnabled.collectAsState()
    val httpsOnly by tabManager.httpsOnlyEnabled.collectAsState()
    val webRtcProtection by tabManager.webRtcProtectionEnabled.collectAsState()
    val safeBrowsing by tabManager.safeBrowsingEnabled.collectAsState()
    val dnsProvider by tabManager.selectedDnsProvider.collectAsState()
    val permissions by tabManager.defaultPermissions.collectAsState()

    var selectedTabIndex by remember { mutableIntStateOf(0) }
    val tabs = listOf("Privacy", "Permissions", "Security")

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
                // Top Navigation Bar
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
                                .background(colors.accentTeal.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Filled.Shield, contentDescription = null, tint = colors.accentTeal, modifier = Modifier.size(20.dp))
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Browser Settings",
                                style = MaterialTheme.typography.titleLarge,
                                color = colors.ink,
                                fontFamily = FontFamily.Serif,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Privacy, Permission & Security Controls",
                                style = MaterialTheme.typography.bodySmall,
                                color = colors.inkMuted,
                                fontSize = 11.sp
                            )
                        }
                    }

                    IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = colors.ink)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Settings Tabs Row
                TabRow(
                    selectedTabIndex = selectedTabIndex,
                    containerColor = colors.surface,
                    contentColor = colors.accentTeal,
                    indicator = { tabPositions ->
                        TabRowDefaults.SecondaryIndicator(
                            modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTabIndex]),
                            color = colors.accentTeal
                        )
                    }
                ) {
                    tabs.forEachIndexed { index, title ->
                        Tab(
                            selected = selectedTabIndex == index,
                            onClick = { selectedTabIndex = index },
                            text = {
                                Text(
                                    text = title,
                                    fontWeight = if (selectedTabIndex == index) FontWeight.Bold else FontWeight.Normal,
                                    fontSize = 14.sp
                                )
                            }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Scrollable tab content
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    when (selectedTabIndex) {
                        0 -> PrivacyTabContent(
                            tabManager = tabManager,
                            trackerBlocker = trackerBlocker,
                            adBlocker = adBlocker,
                            cookieProtection = cookieProtection,
                            fingerprintProtection = fingerprintProtection,
                            httpsOnly = httpsOnly,
                            webRtcProtection = webRtcProtection,
                            dnsProvider = dnsProvider,
                            onOpenPrivacyDashboard = onOpenPrivacyDashboard
                        )
                        1 -> PermissionsTabContent(
                            tabManager = tabManager,
                            permissions = permissions
                        )
                        2 -> SecurityTabContent(
                            tabManager = tabManager,
                            safeBrowsing = safeBrowsing,
                            onOpenPasswordVault = onOpenPasswordVault
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun PrivacyTabContent(
    tabManager: BrowserTabManager,
    trackerBlocker: Boolean,
    adBlocker: Boolean,
    cookieProtection: Boolean,
    fingerprintProtection: Boolean,
    httpsOnly: Boolean,
    webRtcProtection: Boolean,
    dnsProvider: SecureDnsProvider,
    onOpenPrivacyDashboard: () -> Unit
) {
    val colors = LocalSarathColors.current
    val context = LocalContext.current

    // Privacy Dashboard Quick Banner
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(colors.accentTeal.copy(alpha = 0.12f))
            .border(1.dp, colors.accentTeal.copy(alpha = 0.35f), RoundedCornerShape(12.dp))
            .clickable { onOpenPrivacyDashboard() }
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Outlined.Shield, contentDescription = null, tint = colors.accentTeal, modifier = Modifier.size(24.dp))
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text("View Privacy Dashboard", style = MaterialTheme.typography.titleSmall, color = colors.ink, fontWeight = FontWeight.Bold)
                    Text("Telemetry, metrics & protection scores", style = MaterialTheme.typography.bodySmall, color = colors.inkMuted, fontSize = 11.sp)
                }
            }
            Text("Open >", style = MaterialTheme.typography.labelMedium, color = colors.accentTeal, fontWeight = FontWeight.Bold)
        }
    }

    // Protection Modules Card
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(colors.surface)
            .border(1.dp, colors.border, RoundedCornerShape(12.dp))
            .padding(14.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Shields & Filtering", style = MaterialTheme.typography.labelLarge, color = colors.ink, fontWeight = FontWeight.Bold)

            SettingSwitchRow(
                title = "Tracker Blocker",
                subtitle = "Blocks analytics, social beacons & telemetry (EasyPrivacy)",
                checked = trackerBlocker,
                onCheckedChange = { tabManager.trackerBlockerEnabled.value = it }
            )
            HorizontalDivider(color = colors.border.copy(alpha = 0.5f))

            SettingSwitchRow(
                title = "Ad Blocker",
                subtitle = "Eliminates banners, video pre-rolls & popups (EasyList)",
                checked = adBlocker,
                onCheckedChange = { tabManager.adBlockerEnabled.value = it }
            )
            HorizontalDivider(color = colors.border.copy(alpha = 0.5f))

            SettingSwitchRow(
                title = "Cookie Protection",
                subtitle = "Blocks third-party cookies & partitions storage across sites",
                checked = cookieProtection,
                onCheckedChange = { tabManager.cookieProtectionEnabled.value = it }
            )
            HorizontalDivider(color = colors.border.copy(alpha = 0.5f))

            SettingSwitchRow(
                title = "Anti-Fingerprinting Protection",
                subtitle = "Injects noise into Canvas, WebGL, AudioContext & normalizes hardware",
                checked = fingerprintProtection,
                onCheckedChange = { tabManager.fingerprintProtectionEnabled.value = it }
            )
            HorizontalDivider(color = colors.border.copy(alpha = 0.5f))

            SettingSwitchRow(
                title = "HTTPS-Only Mode",
                subtitle = "Automatically upgrades all unencrypted HTTP requests",
                checked = httpsOnly,
                onCheckedChange = { tabManager.httpsOnlyEnabled.value = it }
            )
            HorizontalDivider(color = colors.border.copy(alpha = 0.5f))

            SettingSwitchRow(
                title = "WebRTC Protection",
                subtitle = "Neutralizes STUN leaks to safeguard real local and public IP addresses",
                checked = webRtcProtection,
                onCheckedChange = { tabManager.webRtcProtectionEnabled.value = it }
            )
        }
    }

    // Secure DNS Section
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(colors.surface)
            .border(1.dp, colors.border, RoundedCornerShape(12.dp))
            .padding(14.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Secure DNS (DNS-over-HTTPS)", style = MaterialTheme.typography.labelLarge, color = colors.ink, fontWeight = FontWeight.Bold)

            SecureDnsProvider.values().forEach { provider ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (dnsProvider == provider) colors.accentTeal.copy(alpha = 0.1f) else Color.Transparent)
                        .clickable { tabManager.selectedDnsProvider.value = provider }
                        .padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(provider.providerName, style = MaterialTheme.typography.bodyMedium, color = colors.ink, fontWeight = FontWeight.SemiBold)
                        Text(provider.description, style = MaterialTheme.typography.bodySmall, color = colors.inkMuted, fontSize = 11.sp)
                    }
                    if (dnsProvider == provider) {
                        Text("✓ Active", style = MaterialTheme.typography.labelSmall, color = colors.accentTeal, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }

    // Clear Data Action
    FilledTonalButton(
        onClick = {
            PrivacyEngine.clearAllBrowsingData(context)
            Toast.makeText(context, "All cookies, cache, and WebStorage purged", Toast.LENGTH_SHORT).show()
        },
        modifier = Modifier.fillMaxWidth().testTag("settings_clear_browsing_data_button"),
        colors = ButtonDefaults.filledTonalButtonColors(
            containerColor = Color(0xFFC62828).copy(alpha = 0.12f),
            contentColor = Color(0xFFC62828)
        ),
        shape = RoundedCornerShape(10.dp)
    ) {
        Icon(Icons.Default.DeleteSweep, contentDescription = null, modifier = Modifier.size(18.dp))
        Spacer(modifier = Modifier.width(8.dp))
        Text("Clear Browsing Data (Cookies & Cache)", fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun PermissionsTabContent(
    tabManager: BrowserTabManager,
    permissions: com.example.browser.model.SitePermissions
) {
    val colors = LocalSarathColors.current

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(colors.surface)
            .border(1.dp, colors.border, RoundedCornerShape(12.dp))
            .padding(14.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Default Global Permissions", style = MaterialTheme.typography.labelLarge, color = colors.ink, fontWeight = FontWeight.Bold)
            Text(
                "Configure how websites access device sensors and sensitive features.",
                style = MaterialTheme.typography.bodySmall,
                color = colors.inkMuted,
                fontSize = 12.sp
            )

            SettingSwitchRow(
                title = "Camera Access",
                subtitle = "Allow websites to request camera video feeds",
                checked = permissions.camera,
                onCheckedChange = { tabManager.defaultPermissions.value = permissions.copy(camera = it) }
            )
            HorizontalDivider(color = colors.border.copy(alpha = 0.5f))

            SettingSwitchRow(
                title = "Microphone Access",
                subtitle = "Allow audio recording permissions",
                checked = permissions.microphone,
                onCheckedChange = { tabManager.defaultPermissions.value = permissions.copy(microphone = it) }
            )
            HorizontalDivider(color = colors.border.copy(alpha = 0.5f))

            SettingSwitchRow(
                title = "Location Access",
                subtitle = "Allow precise GPS and IP geolocation",
                checked = permissions.location,
                onCheckedChange = { tabManager.defaultPermissions.value = permissions.copy(location = it) }
            )
            HorizontalDivider(color = colors.border.copy(alpha = 0.5f))

            SettingSwitchRow(
                title = "Push Notifications",
                subtitle = "Allow sites to send background web push alerts",
                checked = permissions.notifications,
                onCheckedChange = { tabManager.defaultPermissions.value = permissions.copy(notifications = it) }
            )
            HorizontalDivider(color = colors.border.copy(alpha = 0.5f))

            SettingSwitchRow(
                title = "Pop-up Windows",
                subtitle = "Allow new tabs / popup redirects to open",
                checked = permissions.popups,
                onCheckedChange = { tabManager.defaultPermissions.value = permissions.copy(popups = it) }
            )
            HorizontalDivider(color = colors.border.copy(alpha = 0.5f))

            SettingSwitchRow(
                title = "Clipboard Access",
                subtitle = "Allow websites to read clipboard data",
                checked = permissions.clipboard,
                onCheckedChange = { tabManager.defaultPermissions.value = permissions.copy(clipboard = it) }
            )
        }
    }
}

@Composable
private fun SecurityTabContent(
    tabManager: BrowserTabManager,
    safeBrowsing: Boolean,
    onOpenPasswordVault: () -> Unit
) {
    val colors = LocalSarathColors.current
    val context = LocalContext.current

    // Password Manager Action Card
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(colors.accentGold.copy(alpha = 0.12f))
            .border(1.dp, colors.accentGold.copy(alpha = 0.35f), RoundedCornerShape(12.dp))
            .clickable { onOpenPasswordVault() }
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Key, contentDescription = null, tint = colors.accentGold, modifier = Modifier.size(24.dp))
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text("Secure Password Manager", style = MaterialTheme.typography.titleSmall, color = colors.ink, fontWeight = FontWeight.Bold)
                    Text("Encrypted credentials vault & passkey storage", style = MaterialTheme.typography.bodySmall, color = colors.inkMuted, fontSize = 11.sp)
                }
            }
            Text("Open Vault >", style = MaterialTheme.typography.labelMedium, color = colors.accentGold, fontWeight = FontWeight.Bold)
        }
    }

    // Default Browser Setup
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(colors.surface)
            .border(1.dp, colors.border, RoundedCornerShape(12.dp))
            .padding(14.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("System Default Browser", style = MaterialTheme.typography.labelLarge, color = colors.ink, fontWeight = FontWeight.Bold)
            Text(
                "Make Sarath Search your system-wide default web browser to intercept external links securely.",
                style = MaterialTheme.typography.bodySmall,
                color = colors.inkMuted,
                fontSize = 12.sp
            )

            Spacer(modifier = Modifier.height(4.dp))

            FilledTonalButton(
                onClick = { requestSetAsDefaultBrowser(context) },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.filledTonalButtonColors(
                    containerColor = colors.accentTeal.copy(alpha = 0.15f),
                    contentColor = colors.accentTeal
                ),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Set as Default Web Browser", fontWeight = FontWeight.Bold)
            }
        }
    }

    // Security Features Card
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(colors.surface)
            .border(1.dp, colors.border, RoundedCornerShape(12.dp))
            .padding(14.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Threat Protection", style = MaterialTheme.typography.labelLarge, color = colors.ink, fontWeight = FontWeight.Bold)

            SettingSwitchRow(
                title = "Safe Browsing / Phishing Protection",
                subtitle = "Warns before opening suspected deceptive or malicious domains",
                checked = safeBrowsing,
                onCheckedChange = { tabManager.safeBrowsingEnabled.value = it }
            )
            HorizontalDivider(color = colors.border.copy(alpha = 0.5f))

            SettingSwitchRow(
                title = "Certificate Validation Warnings",
                subtitle = "Strict SSL certificate verification with warning interstitials",
                checked = true,
                onCheckedChange = {}
            )
            HorizontalDivider(color = colors.border.copy(alpha = 0.5f))

            SettingSwitchRow(
                title = "Malicious Download Protection",
                subtitle = "Inspects file MIME types and prompts before saving executables",
                checked = true,
                onCheckedChange = {}
            )
        }
    }
}

@Composable
private fun SettingSwitchRow(
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    val colors = LocalSarathColors.current
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
            Text(title, style = MaterialTheme.typography.bodyMedium, color = colors.ink, fontWeight = FontWeight.SemiBold)
            Text(subtitle, style = MaterialTheme.typography.bodySmall, color = colors.inkMuted, fontSize = 11.sp)
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = colors.accentTeal,
                checkedTrackColor = colors.accentTeal.copy(alpha = 0.35f)
            )
        )
    }
}
