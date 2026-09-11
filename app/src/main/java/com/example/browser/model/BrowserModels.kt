package com.example.browser.model

import androidx.compose.ui.graphics.Color

/**
 * Container Profiles for isolating cookies, cache, and session identities
 */
enum class BrowserProfile(
    val displayName: String,
    val description: String,
    val badgeColor: Long
) {
    PERSONAL("Personal", "Everyday browsing profile", 0xFF2E7D32),
    WORK("Work", "Isolated corporate & enterprise sessions", 0xFFE65100),
    DEVELOPMENT("Development", "Dev & testing sandbox", 0xFF6A1B9A),
    INCOGNITO("Private Window", "In-memory session · Auto-wipes on close", 0xFF37474F);

    fun getColor(): Color = Color(badgeColor)
}

/**
 * Tab state representation in the Privacy Browser
 */
data class BrowserTab(
    val id: String,
    val url: String,
    val title: String = "New Tab",
    val profile: BrowserProfile = BrowserProfile.PERSONAL,
    val isIncognito: Boolean = profile == BrowserProfile.INCOGNITO,
    val blockedTrackersCount: Int = 0,
    val blockedAdsCount: Int = 0,
    val blockedCookiesCount: Int = 0,
    val fingerprintAttemptsCount: Int = 0,
    val isSecureHttps: Boolean = url.startsWith("https://", ignoreCase = true),
    val isWhitelisted: Boolean = false,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Granular permissions per website
 */
data class SitePermissions(
    val camera: Boolean = false,
    val microphone: Boolean = false,
    val location: Boolean = false,
    val notifications: Boolean = false,
    val popups: Boolean = false,
    val clipboard: Boolean = false
)

/**
 * Encrypted Credential entry in the Secure Password Manager
 */
data class SavedCredential(
    val id: String,
    val domain: String,
    val username: String,
    val encryptedPasswordMask: String,
    val plainPasswordForDemo: String,
    val lastUpdated: Long = System.currentTimeMillis()
)

/**
 * Bookmark entry
 */
data class BrowserBookmark(
    val id: String,
    val title: String,
    val url: String,
    val dateAdded: Long = System.currentTimeMillis()
)

/**
 * Secure DNS Providers (DoH)
 */
enum class SecureDnsProvider(
    val providerName: String,
    val dohEndpoint: String,
    val description: String
) {
    CLOUDFLARE("Cloudflare (1.1.1.1)", "https://cloudflare-dns.com/dns-query", "Privacy-first fast DNS"),
    GOOGLE("Google (8.8.8.8)", "https://dns.google/dns-query", "Reliable worldwide DNS"),
    QUAD9("Quad9 (9.9.9.9)", "https://dns.quad9.net/dns-query", "Malware blocking DNS"),
    SYSTEM("System Default", "", "Standard Android network DNS")
}
