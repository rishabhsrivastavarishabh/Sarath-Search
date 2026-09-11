package com.example.ui.components

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebStorage
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DesktopWindows
import androidx.compose.material.icons.filled.Extension
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.browser.engine.BrowserTabManager
import com.example.browser.engine.PrivacyEngine
import com.example.browser.model.BrowserProfile
import com.example.browser.model.BrowserTab
import com.example.browser.ui.BrowserSettingsDialog
import com.example.browser.ui.PasswordManagerDialog
import com.example.browser.ui.PrivacyDashboardDialog
import com.example.browser.ui.PrivacyShieldDialog
import com.example.browser.ui.TabSwitcherDialog
import com.example.ui.theme.LocalSarathColors
import java.io.ByteArrayInputStream

/**
 * Built-in AdBlock & Anti-Tracker Pattern Engine compatibility wrapper
 */
object AdBlockEngine {
    fun isAdOrTracker(url: String): Boolean {
        return PrivacyEngine.isTracker(url) || PrivacyEngine.isAd(url)
    }
}

/**
 * Helper to request setting Sarath as the default browser in Android OS
 */
fun requestSetAsDefaultBrowser(context: Context) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        val roleManager = context.getSystemService(Context.ROLE_SERVICE) as? android.app.role.RoleManager
        if (roleManager != null && roleManager.isRoleAvailable(android.app.role.RoleManager.ROLE_BROWSER)) {
            if (!roleManager.isRoleHeld(android.app.role.RoleManager.ROLE_BROWSER)) {
                val intent = roleManager.createRequestRoleIntent(android.app.role.RoleManager.ROLE_BROWSER)
                context.startActivity(intent)
                return
            } else {
                Toast.makeText(context, "Sarath Search is already your default browser", Toast.LENGTH_SHORT).show()
                return
            }
        }
    }
    // Fallback: Open Default Apps settings in Android OS
    try {
        val intent = Intent(android.provider.Settings.ACTION_MANAGE_DEFAULT_APPS_SETTINGS)
        context.startActivity(intent)
    } catch (_: Exception) {
        try {
            val intent = Intent(android.provider.Settings.ACTION_SETTINGS)
            context.startActivity(intent)
        } catch (_: Exception) {
            Toast.makeText(context, "Please set Sarath Search as default browser in Android Settings", Toast.LENGTH_LONG).show()
        }
    }
}

/**
 * Production-Ready Privacy-Focused Web Browser
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun InAppBrowserDialog(
    url: String,
    onDismiss: () -> Unit
) {
    val colors = LocalSarathColors.current
    val context = LocalContext.current
    val tabManager = remember { BrowserTabManager(context) }

    val tabs by tabManager.tabs.collectAsState()
    val activeTabId by tabManager.activeTabId.collectAsState()
    val activeTab = remember(tabs, activeTabId) {
        tabs.find { it.id == activeTabId } ?: tabs.firstOrNull() ?: BrowserTab(id = "default", url = url)
    }

    var webViewInstance by remember { mutableStateOf<WebView?>(null) }
    var omniboxInput by remember { mutableStateOf(url) }
    var isEditingOmnibox by remember { mutableStateOf(false) }
    var progress by remember { mutableFloatStateOf(0f) }
    var isLoading by remember { mutableStateOf(true) }
    var canGoBack by remember { mutableStateOf(false) }
    var canGoForward by remember { mutableStateOf(false) }
    var showPhishingWarning by remember { mutableStateOf(false) }

    // Dialog state controllers
    var showShieldReportDialog by remember { mutableStateOf(false) }
    var showPrivacyDashboardDialog by remember { mutableStateOf(false) }
    var showTabSwitcherDialog by remember { mutableStateOf(false) }
    var showPasswordVaultDialog by remember { mutableStateOf(false) }
    var showBrowserSettingsDialog by remember { mutableStateOf(false) }
    var showOverflowMenu by remember { mutableStateOf(false) }

    // Global settings
    val trackerBlockerEnabled by tabManager.trackerBlockerEnabled.collectAsState()
    val adBlockerEnabled by tabManager.adBlockerEnabled.collectAsState()
    val cookieProtectionEnabled by tabManager.cookieProtectionEnabled.collectAsState()
    val fingerprintProtectionEnabled by tabManager.fingerprintProtectionEnabled.collectAsState()
    val httpsOnlyEnabled by tabManager.httpsOnlyEnabled.collectAsState()
    val desktopModeEnabled by tabManager.desktopModeEnabled.collectAsState()

    // Sync omnibox with active tab URL when tab switches
    LaunchedEffect(activeTab.url) {
        omniboxInput = activeTab.url
        if (PrivacyEngine.isPhishingOrMalicious(activeTab.url)) {
            showPhishingWarning = true
        } else {
            showPhishingWarning = false
            webViewInstance?.loadUrl(activeTab.url)
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false)
    ) {
        BackHandler {
            if (webViewInstance?.canGoBack() == true) {
                webViewInstance?.goBack()
            } else {
                onDismiss()
            }
        }

        Surface(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding(),
            color = if (activeTab.isIncognito) Color(0xFF1E2429) else colors.bg
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Top Omnibox Toolbar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(if (activeTab.isIncognito) Color(0xFF263238) else colors.surface)
                        .padding(horizontal = 8.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Close Browser
                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.size(36.dp).testTag("in_app_browser_close_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close Browser",
                            tint = if (activeTab.isIncognito) Color.White else colors.ink
                        )
                    }

                    // Omnibox URL / Search Bar
                    Row(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(20.dp))
                            .background(if (activeTab.isIncognito) Color(0xFF1E2429) else colors.bg)
                            .border(
                                1.dp,
                                if (activeTab.isIncognito) Color(0xFF455A64) else colors.border,
                                RoundedCornerShape(20.dp)
                            )
                            .padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // SSL Lock or Insecure Warning Icon
                        Icon(
                            imageVector = if (activeTab.isSecureHttps) Icons.Default.Lock else Icons.Default.Warning,
                            contentDescription = if (activeTab.isSecureHttps) "Secure HTTPS" else "Insecure HTTP",
                            tint = if (activeTab.isSecureHttps) Color(0xFF2E7D32) else Color(0xFFC62828),
                            modifier = Modifier.size(14.dp)
                        )

                        Spacer(modifier = Modifier.width(6.dp))

                        // URL / Search Input
                        BasicTextField(
                            value = omniboxInput,
                            onValueChange = {
                                omniboxInput = it
                                isEditingOmnibox = true
                            },
                            textStyle = TextStyle(
                                color = if (activeTab.isIncognito) Color.White else colors.ink,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Normal
                            ),
                            cursorBrush = SolidColor(colors.accentTeal),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Go),
                            keyboardActions = KeyboardActions(
                                onGo = {
                                    isEditingOmnibox = false
                                    val processedUrl = if (!omniboxInput.startsWith("http://") && !omniboxInput.startsWith("https://")) {
                                        if (omniboxInput.contains(".") && !omniboxInput.contains(" ")) {
                                            "https://$omniboxInput"
                                        } else {
                                            "https://duckduckgo.com/?q=${Uri.encode(omniboxInput)}"
                                        }
                                    } else {
                                        omniboxInput
                                    }
                                    tabManager.updateTabUrl(activeTab.id, processedUrl, activeTab.title)
                                    webViewInstance?.loadUrl(processedUrl)
                                }
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("browser_omnibox_input")
                        )

                        // Privacy Shield Button with live blocked badge
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(
                                    if (activeTab.isWhitelisted) colors.border
                                    else colors.accentTeal.copy(alpha = 0.18f)
                                )
                                .clickable { showShieldReportDialog = true }
                                .padding(horizontal = 6.dp, vertical = 3.dp)
                                .testTag("browser_shield_badge")
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Outlined.Shield,
                                    contentDescription = "Shield Protection",
                                    tint = if (activeTab.isWhitelisted) colors.inkMuted else colors.accentTeal,
                                    modifier = Modifier.size(13.dp)
                                )
                                Spacer(modifier = Modifier.width(3.dp))
                                Text(
                                    text = "${activeTab.blockedTrackersCount + activeTab.blockedAdsCount}",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = if (activeTab.isWhitelisted) colors.inkMuted else colors.accentTeal,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                )
                            }
                        }
                    }

                    // Reload Button
                    IconButton(
                        onClick = { webViewInstance?.reload() },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Reload Page",
                            tint = if (activeTab.isIncognito) Color.White.copy(alpha = 0.8f) else colors.inkMuted,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    // Tab Switcher Button (shows tabs count)
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(colors.accentGold.copy(alpha = 0.15f))
                            .border(1.dp, colors.accentGold, RoundedCornerShape(8.dp))
                            .clickable { showTabSwitcherDialog = true }
                            .testTag("browser_tabs_counter_button"),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "${tabs.size}",
                            style = MaterialTheme.typography.labelMedium,
                            color = colors.accentGold,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    }

                    // Overflow Menu
                    Box {
                        IconButton(
                            onClick = { showOverflowMenu = true },
                            modifier = Modifier.size(36.dp).testTag("browser_overflow_menu_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.MoreVert,
                                contentDescription = "More Options",
                                tint = if (activeTab.isIncognito) Color.White else colors.ink
                            )
                        }

                        DropdownMenu(
                            expanded = showOverflowMenu,
                            onDismissRequest = { showOverflowMenu = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("Privacy Dashboard") },
                                onClick = {
                                    showOverflowMenu = false
                                    showPrivacyDashboardDialog = true
                                },
                                leadingIcon = { Icon(Icons.Default.Shield, contentDescription = null, tint = colors.accentTeal) }
                            )
                            DropdownMenuItem(
                                text = { Text("Password Vault") },
                                onClick = {
                                    showOverflowMenu = false
                                    showPasswordVaultDialog = true
                                },
                                leadingIcon = { Icon(Icons.Default.Key, contentDescription = null, tint = colors.accentGold) }
                            )
                            DropdownMenuItem(
                                text = { Text("Browser Settings") },
                                onClick = {
                                    showOverflowMenu = false
                                    showBrowserSettingsDialog = true
                                },
                                leadingIcon = { Icon(Icons.Default.Security, contentDescription = null, tint = colors.ink) }
                            )
                            DropdownMenuItem(
                                text = { Text("New Private Window") },
                                onClick = {
                                    showOverflowMenu = false
                                    tabManager.openPrivateTab()
                                },
                                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = Color(0xFF6A1B9A)) }
                            )
                            DropdownMenuItem(
                                text = { Text(if (desktopModeEnabled) "Mobile Layout" else "Desktop Site") },
                                onClick = {
                                    showOverflowMenu = false
                                    tabManager.desktopModeEnabled.value = !desktopModeEnabled
                                    webViewInstance?.reload()
                                },
                                leadingIcon = { Icon(Icons.Default.DesktopWindows, contentDescription = null) }
                            )
                            DropdownMenuItem(
                                text = { Text("Set as Default Browser") },
                                onClick = {
                                    showOverflowMenu = false
                                    requestSetAsDefaultBrowser(context)
                                },
                                leadingIcon = { Icon(Icons.Default.CheckCircle, contentDescription = null, tint = colors.accentTeal) }
                            )
                        }
                    }
                }

                // Loading progress bar
                AnimatedVisibility(
                    visible = isLoading && progress < 1f,
                    enter = fadeIn(),
                    exit = fadeOut()
                ) {
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier.fillMaxWidth().height(2.dp),
                        color = colors.accentTeal,
                        trackColor = colors.border
                    )
                }

                // Phishing Warning Interstitial
                if (showPhishingWarning) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .background(Color(0xFF1E2429))
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Icon(Icons.Default.Warning, contentDescription = null, tint = Color(0xFFC62828), modifier = Modifier.size(56.dp))
                            Text(
                                text = "Deceptive Site Warning",
                                style = MaterialTheme.typography.titleLarge,
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Sarath Safe Browsing detected that '${activeTab.url}' is reported for phishing or identity theft.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Color.LightGray
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                androidx.compose.material3.Button(
                                    onClick = {
                                        showPhishingWarning = false
                                        tabManager.updateTabUrl(activeTab.id, "https://sarath.ai", "Sarath Search")
                                    },
                                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(containerColor = colors.accentTeal)
                                ) {
                                    Text("Back to Safety")
                                }
                                androidx.compose.material3.TextButton(
                                    onClick = {
                                        showPhishingWarning = false
                                        webViewInstance?.loadUrl(activeTab.url)
                                    }
                                ) {
                                    Text("Proceed Anyway (Unsafe)", color = Color.LightGray)
                                }
                            }
                        }
                    }
                } else {
                    // WebView Content
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .background(colors.surface)
                    ) {
                        AndroidView(
                            factory = { ctx ->
                                WebView(ctx).apply {
                                    settings.apply {
                                        javaScriptEnabled = true
                                        domStorageEnabled = true
                                        loadWithOverviewMode = true
                                        useWideViewPort = true
                                        setSupportZoom(true)
                                        builtInZoomControls = true
                                        displayZoomControls = false
                                    }

                                    // Block third-party cookies if cookieProtectionEnabled is active
                                    if (cookieProtectionEnabled) {
                                        CookieManager.getInstance().setAcceptThirdPartyCookies(this, false)
                                    }

                                    webViewClient = object : WebViewClient() {
                                        override fun onPageStarted(view: WebView?, pageUrl: String?, favicon: Bitmap?) {
                                            isLoading = true
                                            pageUrl?.let {
                                                if (it != omniboxInput && !isEditingOmnibox) {
                                                    omniboxInput = it
                                                }
                                                tabManager.updateTabUrl(activeTab.id, it, activeTab.title)
                                            }
                                            canGoBack = view?.canGoBack() == true
                                            canGoForward = view?.canGoForward() == true

                                            // Inject Anti-Fingerprinting Javascript
                                            if (fingerprintProtectionEnabled) {
                                                view?.evaluateJavascript(PrivacyEngine.ANTI_FINGERPRINTING_JS, null)
                                            }
                                        }

                                        override fun onPageFinished(view: WebView?, pageUrl: String?) {
                                            isLoading = false
                                            pageUrl?.let { tabManager.updateTabUrl(activeTab.id, it, view?.title ?: activeTab.title) }
                                            canGoBack = view?.canGoBack() == true
                                            canGoForward = view?.canGoForward() == true

                                            if (fingerprintProtectionEnabled) {
                                                view?.evaluateJavascript(PrivacyEngine.ANTI_FINGERPRINTING_JS, null)
                                            }
                                        }

                                        override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? {
                                            val reqUrl = request?.url?.toString() ?: return super.shouldInterceptRequest(view, request)

                                            // Tracker Block
                                            if (trackerBlockerEnabled && !activeTab.isWhitelisted && PrivacyEngine.isTracker(reqUrl)) {
                                                tabManager.recordBlockedTracker(activeTab.id)
                                                return WebResourceResponse("text/plain", "UTF-8", ByteArrayInputStream(ByteArray(0)))
                                            }

                                            // Ad Block
                                            if (adBlockerEnabled && !activeTab.isWhitelisted && PrivacyEngine.isAd(reqUrl)) {
                                                tabManager.recordBlockedAd(activeTab.id)
                                                return WebResourceResponse("text/plain", "UTF-8", ByteArrayInputStream(ByteArray(0)))
                                            }

                                            return super.shouldInterceptRequest(view, request)
                                        }
                                    }

                                    webChromeClient = object : WebChromeClient() {
                                        override fun onProgressChanged(view: WebView?, newProgress: Int) {
                                            progress = newProgress / 100f
                                            if (newProgress >= 100) isLoading = false
                                        }

                                        override fun onReceivedTitle(view: WebView?, title: String?) {
                                            title?.let { tabManager.updateTabUrl(activeTab.id, activeTab.url, it) }
                                        }
                                    }

                                    loadUrl(activeTab.url)
                                    webViewInstance = this
                                }
                            },
                            update = { webView ->
                                if (desktopModeEnabled) {
                                    webView.settings.userAgentString = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
                                } else {
                                    webView.settings.userAgentString = null
                                }
                            },
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                }

                // Chrome-Style Bottom Navigation Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(if (activeTab.isIncognito) Color(0xFF263238) else colors.surface)
                        .border(width = 0.5.dp, color = colors.border)
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Back
                    IconButton(
                        onClick = { webViewInstance?.goBack() },
                        enabled = canGoBack,
                        modifier = Modifier.size(40.dp)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = if (canGoBack) (if (activeTab.isIncognito) Color.White else colors.ink) else colors.inkMuted.copy(alpha = 0.4f)
                        )
                    }

                    // Forward
                    IconButton(
                        onClick = { webViewInstance?.goForward() },
                        enabled = canGoForward,
                        modifier = Modifier.size(40.dp)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = "Forward",
                            tint = if (canGoForward) (if (activeTab.isIncognito) Color.White else colors.ink) else colors.inkMuted.copy(alpha = 0.4f)
                        )
                    }

                    // Home Button
                    IconButton(
                        onClick = {
                            tabManager.updateTabUrl(activeTab.id, "https://sarath.ai", "Sarath Search")
                            webViewInstance?.loadUrl("https://sarath.ai")
                        },
                        modifier = Modifier.size(40.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Home,
                            contentDescription = "Home",
                            tint = if (activeTab.isIncognito) Color.White else colors.ink
                        )
                    }

                    // Privacy Shield Report
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(colors.accentTeal.copy(alpha = 0.15f))
                            .clickable { showShieldReportDialog = true }
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Security, contentDescription = null, tint = colors.accentTeal, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Shields: ${activeTab.blockedTrackersCount + activeTab.blockedAdsCount}",
                                style = MaterialTheme.typography.labelSmall,
                                color = colors.accentTeal,
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp
                            )
                        }
                    }

                    // Share Webpage
                    IconButton(
                        onClick = {
                            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_TEXT, activeTab.url)
                                putExtra(Intent.EXTRA_SUBJECT, activeTab.title)
                            }
                            context.startActivity(Intent.createChooser(shareIntent, "Share Webpage"))
                        },
                        modifier = Modifier.size(40.dp)
                    ) {
                        Icon(Icons.Default.Share, contentDescription = "Share", tint = colors.inkMuted)
                    }
                }
            }
        }
    }

    // Website Privacy Report Dialog
    if (showShieldReportDialog) {
        PrivacyShieldDialog(
            tab = activeTab,
            trackerBlockerEnabled = trackerBlockerEnabled,
            onToggleTrackerBlocker = { tabManager.trackerBlockerEnabled.value = !trackerBlockerEnabled },
            adBlockerEnabled = adBlockerEnabled,
            onToggleAdBlocker = {
                tabManager.adBlockerEnabled.value = !adBlockerEnabled
                webViewInstance?.reload()
            },
            cookieProtectionEnabled = cookieProtectionEnabled,
            onToggleCookieProtection = { tabManager.cookieProtectionEnabled.value = !cookieProtectionEnabled },
            fingerprintProtectionEnabled = fingerprintProtectionEnabled,
            onToggleFingerprintProtection = { tabManager.fingerprintProtectionEnabled.value = !fingerprintProtectionEnabled },
            onToggleWhitelist = { tabManager.toggleSiteWhitelist(activeTab.url) },
            onOpenSitePermissions = {
                showShieldReportDialog = false
                showBrowserSettingsDialog = true
            },
            onDismiss = { showShieldReportDialog = false }
        )
    }

    // Privacy Dashboard Dialog
    if (showPrivacyDashboardDialog) {
        val totalTrackers = tabs.sumOf { it.blockedTrackersCount }
        val totalAds = tabs.sumOf { it.blockedAdsCount }
        val totalCookies = tabs.sumOf { it.blockedCookiesCount }
        val privacyScore = PrivacyEngine.calculatePrivacyScore(
            trackerBlockerEnabled = trackerBlockerEnabled,
            adBlockerEnabled = adBlockerEnabled,
            cookieProtectionEnabled = cookieProtectionEnabled,
            fingerprintProtectionEnabled = fingerprintProtectionEnabled,
            httpsOnlyEnabled = httpsOnlyEnabled,
            webRtcProtectionEnabled = true,
            isSecureHttps = activeTab.isSecureHttps
        )

        PrivacyDashboardDialog(
            privacyScore = privacyScore,
            totalTrackersBlocked = totalTrackers,
            totalAdsBlocked = totalAds,
            totalCookiesBlocked = totalCookies,
            httpsEnabled = httpsOnlyEnabled,
            fingerprintProtectionEnabled = fingerprintProtectionEnabled,
            onClearAllBrowsingData = {
                PrivacyEngine.clearAllBrowsingData(context)
                Toast.makeText(context, "All site data and cookies cleared", Toast.LENGTH_SHORT).show()
            },
            onDismiss = { showPrivacyDashboardDialog = false }
        )
    }

    // Tab Switcher Dialog
    if (showTabSwitcherDialog) {
        TabSwitcherDialog(
            tabs = tabs,
            activeTabId = activeTabId,
            onSelectTab = { tabManager.switchTab(it) },
            onCloseTab = { tabManager.closeTab(it) },
            onNewTab = { profile -> tabManager.openNewTab(profile = profile) },
            onCloseAllTabs = { tabManager.closeAllTabs() },
            onDismiss = { showTabSwitcherDialog = false }
        )
    }

    // Password Vault Dialog
    if (showPasswordVaultDialog) {
        PasswordManagerDialog(onDismiss = { showPasswordVaultDialog = false })
    }

    // Browser Settings Dialog
    if (showBrowserSettingsDialog) {
        BrowserSettingsDialog(
            tabManager = tabManager,
            onOpenPasswordVault = {
                showBrowserSettingsDialog = false
                showPasswordVaultDialog = true
            },
            onOpenPrivacyDashboard = {
                showBrowserSettingsDialog = false
                showPrivacyDashboardDialog = true
            },
            onDismiss = { showBrowserSettingsDialog = false }
        )
    }
}
