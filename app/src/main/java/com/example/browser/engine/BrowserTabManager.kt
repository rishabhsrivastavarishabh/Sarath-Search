package com.example.browser.engine

import android.content.Context
import com.example.browser.model.BrowserBookmark
import com.example.browser.model.BrowserProfile
import com.example.browser.model.BrowserTab
import com.example.browser.model.SecureDnsProvider
import com.example.browser.model.SitePermissions
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.util.UUID

/**
 * Manages Tabs, Profiles, Bookmarks, and Global Browser Settings
 */
class BrowserTabManager(private val context: Context) {

    private val initialTab = BrowserTab(
        id = UUID.randomUUID().toString(),
        url = "https://news.ycombinator.com",
        title = "Hacker News",
        profile = BrowserProfile.PERSONAL
    )

    private val _tabs = MutableStateFlow<List<BrowserTab>>(listOf(initialTab))
    val tabs: StateFlow<List<BrowserTab>> = _tabs.asStateFlow()

    private val _activeTabId = MutableStateFlow(initialTab.id)
    val activeTabId: StateFlow<String> = _activeTabId.asStateFlow()

    // Global Browser Settings
    val trackerBlockerEnabled = MutableStateFlow(true)
    val adBlockerEnabled = MutableStateFlow(true)
    val cookieProtectionEnabled = MutableStateFlow(true)
    val fingerprintProtectionEnabled = MutableStateFlow(true)
    val httpsOnlyEnabled = MutableStateFlow(true)
    val webRtcProtectionEnabled = MutableStateFlow(true)
    val safeBrowsingEnabled = MutableStateFlow(true)
    val desktopModeEnabled = MutableStateFlow(false)
    val selectedDnsProvider = MutableStateFlow(SecureDnsProvider.CLOUDFLARE)

    // Global Default Permissions
    val defaultPermissions = MutableStateFlow(
        SitePermissions(
            camera = false,
            microphone = false,
            location = false,
            notifications = true,
            popups = false,
            clipboard = false
        )
    )

    // Per-site permissions map (domain -> SitePermissions)
    private val _sitePermissions = MutableStateFlow<Map<String, SitePermissions>>(emptyMap())
    val sitePermissions: StateFlow<Map<String, SitePermissions>> = _sitePermissions.asStateFlow()

    // Whitelisted websites (domain -> Boolean)
    private val _whitelistedSites = MutableStateFlow<Set<String>>(emptySet())
    val whitelistedSites: StateFlow<Set<String>> = _whitelistedSites.asStateFlow()

    // Bookmarks
    private val _bookmarks = MutableStateFlow<List<BrowserBookmark>>(
        listOf(
            BrowserBookmark(UUID.randomUUID().toString(), "Wikipedia", "https://en.wikipedia.org"),
            BrowserBookmark(UUID.randomUUID().toString(), "Sarath Search", "https://sarath.ai"),
            BrowserBookmark(UUID.randomUUID().toString(), "EFF Surveillance Self-Defense", "https://ssd.eff.org")
        )
    )
    val bookmarks: StateFlow<List<BrowserBookmark>> = _bookmarks.asStateFlow()

    fun getActiveTab(): BrowserTab? {
        return _tabs.value.find { it.id == _activeTabId.value } ?: _tabs.value.firstOrNull()
    }

    fun openNewTab(url: String = "https://sarath.ai", profile: BrowserProfile = BrowserProfile.PERSONAL): BrowserTab {
        val newTab = BrowserTab(
            id = UUID.randomUUID().toString(),
            url = url,
            title = if (url.contains("sarath")) "Sarath Search" else "New Tab",
            profile = profile
        )
        _tabs.update { it + newTab }
        _activeTabId.value = newTab.id
        return newTab
    }

    fun openPrivateTab(url: String = "https://duckduckgo.com"): BrowserTab {
        return openNewTab(url = url, profile = BrowserProfile.INCOGNITO)
    }

    fun switchTab(tabId: String) {
        if (_tabs.value.any { it.id == tabId }) {
            _activeTabId.value = tabId
        }
    }

    fun closeTab(tabId: String) {
        val closingTab = _tabs.value.find { it.id == tabId }
        if (closingTab?.isIncognito == true) {
            // Auto-wipe session data for closed private tab
            PrivacyEngine.clearPrivateBrowsingData(context, null)
        }

        val remaining = _tabs.value.filterNot { it.id == tabId }
        if (remaining.isEmpty()) {
            val fresh = BrowserTab(
                id = UUID.randomUUID().toString(),
                url = "https://sarath.ai",
                title = "Sarath Search",
                profile = BrowserProfile.PERSONAL
            )
            _tabs.value = listOf(fresh)
            _activeTabId.value = fresh.id
        } else {
            _tabs.value = remaining
            if (_activeTabId.value == tabId) {
                _activeTabId.value = remaining.last().id
            }
        }
    }

    fun closeAllTabs() {
        PrivacyEngine.clearPrivateBrowsingData(context, null)
        val fresh = BrowserTab(
            id = UUID.randomUUID().toString(),
            url = "https://sarath.ai",
            title = "Sarath Search",
            profile = BrowserProfile.PERSONAL
        )
        _tabs.value = listOf(fresh)
        _activeTabId.value = fresh.id
    }

    fun updateTabUrl(tabId: String, newUrl: String, newTitle: String) {
        _tabs.update { list ->
            list.map { tab ->
                if (tab.id == tabId) {
                    val domain = PrivacyEngine.extractDomain(newUrl)
                    val isWhitelisted = _whitelistedSites.value.contains(domain)
                    tab.copy(
                        url = newUrl,
                        title = newTitle.ifBlank { tab.title },
                        isSecureHttps = newUrl.startsWith("https://", ignoreCase = true),
                        isWhitelisted = isWhitelisted
                    )
                } else tab
            }
        }
    }

    fun recordBlockedTracker(tabId: String) {
        _tabs.update { list ->
            list.map { if (it.id == tabId) it.copy(blockedTrackersCount = it.blockedTrackersCount + 1) else it }
        }
    }

    fun recordBlockedAd(tabId: String) {
        _tabs.update { list ->
            list.map { if (it.id == tabId) it.copy(blockedAdsCount = it.blockedAdsCount + 1) else it }
        }
    }

    fun recordBlockedCookie(tabId: String) {
        _tabs.update { list ->
            list.map { if (it.id == tabId) it.copy(blockedCookiesCount = it.blockedCookiesCount + 1) else it }
        }
    }

    fun recordFingerprintAttempt(tabId: String) {
        _tabs.update { list ->
            list.map { if (it.id == tabId) it.copy(fingerprintAttemptsCount = it.fingerprintAttemptsCount + 1) else it }
        }
    }

    fun toggleSiteWhitelist(url: String) {
        val domain = PrivacyEngine.extractDomain(url)
        _whitelistedSites.update { current ->
            if (current.contains(domain)) current - domain else current + domain
        }
        val isNowWhitelisted = _whitelistedSites.value.contains(domain)
        _tabs.update { list ->
            list.map { tab ->
                if (PrivacyEngine.extractDomain(tab.url) == domain) {
                    tab.copy(isWhitelisted = isNowWhitelisted)
                } else tab
            }
        }
    }

    fun addBookmark(title: String, url: String) {
        val newBookmark = BrowserBookmark(UUID.randomUUID().toString(), title.ifBlank { url }, url)
        _bookmarks.update { it + newBookmark }
    }

    fun removeBookmark(id: String) {
        _bookmarks.update { it.filterNot { bm -> bm.id == id } }
    }
}
