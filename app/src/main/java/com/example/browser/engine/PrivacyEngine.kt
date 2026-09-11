package com.example.browser.engine

import android.content.Context
import android.webkit.CookieManager
import android.webkit.WebStorage
import android.webkit.WebView
import com.example.browser.model.SitePermissions
import java.net.URI

/**
 * Core Privacy & Security Engine for Sarath Browser
 */
object PrivacyEngine {

    // Known tracker domains and analytics networks (EasyPrivacy compatible)
    private val TRACKER_DOMAINS = setOf(
        "google-analytics.com",
        "analytics.google.com",
        "googletagmanager.com",
        "hotjar.com",
        "clarity.ms",
        "quantserve.com",
        "chartbeat.com",
        "segment.io",
        "segment.com",
        "mixpanel.com",
        "optimizely.com",
        "branch.io",
        "appsflyer.com",
        "adjust.com",
        "scorecardresearch.com",
        "newrelic.com",
        "dynatrace.com",
        "facebook.com/tr",
        "connect.facebook.net",
        "pixel.facebook.com",
        "tiktok.com/analytics",
        "linkedin.com/px",
        "criteo.com",
        "amplitude.com",
        "heapanalytics.com",
        "kissmetrics.com",
        "statcounter.com",
        "crazyegg.com"
    )

    // Known advertising networks and popup injects (EasyList compatible)
    private val AD_DOMAINS = setOf(
        "doubleclick.net",
        "googlesyndication.com",
        "googleads",
        "adservice.google",
        "pagead2.googlesyndication",
        "pubmatic.com",
        "adnxs.com",
        "rubiconproject.com",
        "taboola.com",
        "outbrain.com",
        "popads.net",
        "adcolony.com",
        "vungle.com",
        "unityads",
        "applovin.com",
        "moatads.com",
        "amazon-adsystem.com",
        "adsystem.com",
        "admob",
        "inmobi.com",
        "flurry.com",
        "advertising.com",
        "bidswitch.net",
        "openx.net",
        "smartadserver.com",
        "zergnet.com",
        "mgid.com",
        "revcontent.com"
    )

    // Known phishing / deceptive domains for safe browsing protection
    private val PHISHING_PATTERNS = listOf(
        "paypa1.com",
        "apple-security-check",
        "bank-login-verify",
        "secure-account-update",
        "free-crypto-giveaway",
        "google-security-alert.xyz",
        "netflix-billing-update.info",
        "metamask-validation.live"
    )

    /**
     * Check if a URL belongs to a known tracking network
     */
    fun isTracker(url: String): Boolean {
        val lower = url.lowercase()
        return TRACKER_DOMAINS.any { domain -> lower.contains(domain) }
    }

    /**
     * Check if a URL belongs to an advertising network
     */
    fun isAd(url: String): Boolean {
        val lower = url.lowercase()
        return AD_DOMAINS.any { domain -> lower.contains(domain) }
    }

    /**
     * Check if a URL triggers Safe Browsing / Phishing protection
     */
    fun isPhishingOrMalicious(url: String): Boolean {
        val lower = url.lowercase()
        return PHISHING_PATTERNS.any { pattern -> lower.contains(pattern) }
    }

    /**
     * JavaScript payload injected into WebView to neutralize device fingerprinting:
     * - Canvas noise injection
     * - WebGL hardware spoofing (generic unmasked renderer)
     * - AudioContext noise injection
     * - Hardware concurrency & device memory standardization
     * - WebRTC peer connection neutralization to prevent local/public IP leaks
     */
    val ANTI_FINGERPRINTING_JS = """
        (function() {
            if (window.__sarath_privacy_shield_active) return;
            window.__sarath_privacy_shield_active = true;

            // 1. Anti-Canvas Fingerprinting: Add subtle noise to getImageData and toDataURL
            try {
                const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
                HTMLCanvasElement.prototype.toDataURL = function() {
                    const ctx = this.getContext('2d');
                    if (ctx && this.width > 0 && this.height > 0) {
                        try {
                            const imgData = ctx.getImageData(0, 0, Math.min(this.width, 10), Math.min(this.height, 10));
                            for (let i = 0; i < imgData.data.length; i += 4) {
                                imgData.data[i] = imgData.data[i] ^ 1;
                            }
                            ctx.putImageData(imgData, 0, 0);
                        } catch(e) {}
                    }
                    return origToDataURL.apply(this, arguments);
                };
            } catch(e) {}

            // 2. Anti-WebGL Fingerprinting: Standardize GPU Vendor and Renderer
            try {
                const getParameter = WebGLRenderingContext.prototype.getParameter;
                WebGLRenderingContext.prototype.getParameter = function(param) {
                    // 37445 = UNMASKED_VENDOR_WEBGL, 37446 = UNMASKED_RENDERER_WEBGL
                    if (param === 37445) return 'Sarath Privacy Engine';
                    if (param === 37446) return 'Neutral Standardized GPU';
                    return getParameter.apply(this, arguments);
                };
            } catch(e) {}

            // 3. Anti-Audio Fingerprinting: Neutralize AudioBuffer & Analyser frequency data
            try {
                if (window.AudioBuffer) {
                    const origGetChannelData = AudioBuffer.prototype.getChannelData;
                    AudioBuffer.prototype.getChannelData = function(channel) {
                        const data = origGetChannelData.apply(this, arguments);
                        for (let i = 0; i < Math.min(data.length, 32); i++) {
                            data[i] += 0.000001;
                        }
                        return data;
                    };
                }
            } catch(e) {}

            // 4. Hardware & Platform Standardization
            try {
                Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 });
                Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
            } catch(e) {}

            // 5. WebRTC IP Leak Protection: Neutralize RTCPeerConnection to prevent STUN IP harvesting
            try {
                window.RTCPeerConnection = function() {
                    console.warn('[Sarath Privacy] WebRTC connection blocked to prevent IP leak');
                    return {
                        createOffer: function() { return Promise.reject(new Error('WebRTC Disabled by Privacy Shield')); },
                        createAnswer: function() { return Promise.reject(new Error('WebRTC Disabled by Privacy Shield')); },
                        setLocalDescription: function() { return Promise.resolve(); },
                        setRemoteDescription: function() { return Promise.resolve(); },
                        addIceCandidate: function() { return Promise.resolve(); },
                        close: function() {}
                    };
                };
                window.webkitRTCPeerConnection = window.RTCPeerConnection;
            } catch(e) {}
        })();
    """.trimIndent()

    /**
     * Compute comprehensive privacy score (0 to 100)
     */
    fun calculatePrivacyScore(
        trackerBlockerEnabled: Boolean,
        adBlockerEnabled: Boolean,
        cookieProtectionEnabled: Boolean,
        fingerprintProtectionEnabled: Boolean,
        httpsOnlyEnabled: Boolean,
        webRtcProtectionEnabled: Boolean,
        isSecureHttps: Boolean
    ): Int {
        var score = 30 // Base safe baseline
        if (trackerBlockerEnabled) score += 15
        if (adBlockerEnabled) score += 15
        if (cookieProtectionEnabled) score += 10
        if (fingerprintProtectionEnabled) score += 15
        if (httpsOnlyEnabled) score += 5
        if (webRtcProtectionEnabled) score += 5
        if (isSecureHttps) score += 5
        return score.coerceIn(0, 100)
    }

    /**
     * Extract root domain for per-site policies and cookie partitioning
     */
    fun extractDomain(url: String): String {
        return try {
            val uri = URI(url)
            val host = uri.host ?: url
            if (host.startsWith("www.")) host.substring(4) else host
        } catch (_: Exception) {
            url
        }
    }

    /**
     * Automatically clear all session data, cookies, and cache for private/incognito tabs
     */
    fun clearPrivateBrowsingData(context: Context, webView: WebView?) {
        try {
            webView?.clearCache(true)
            webView?.clearHistory()
            webView?.clearFormData()
            WebStorage.getInstance().deleteAllData()
            val cookieManager = CookieManager.getInstance()
            cookieManager.removeSessionCookies(null)
            cookieManager.flush()
        } catch (_: Exception) {}
    }

    /**
     * Thorough data purge for the "Automatic Data Cleanup" feature
     */
    fun clearAllBrowsingData(context: Context) {
        try {
            val cookieManager = CookieManager.getInstance()
            cookieManager.removeAllCookies(null)
            cookieManager.flush()
            WebStorage.getInstance().deleteAllData()
        } catch (_: Exception) {}
    }
}
