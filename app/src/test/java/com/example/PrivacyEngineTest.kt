package com.example

import com.example.browser.engine.PasswordVaultManager
import com.example.browser.engine.PrivacyEngine
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Unit tests verifying PrivacyEngine rules, threat detection, and password vault
 */
class PrivacyEngineTest {

    @Test
    fun testTrackerDetection() {
        assertTrue(PrivacyEngine.isTracker("https://www.google-analytics.com/analytics.js"))
        assertTrue(PrivacyEngine.isTracker("https://connect.facebook.net/en_US/fbevents.js"))
        assertTrue(PrivacyEngine.isTracker("https://static.hotjar.com/c/hotjar-12345.js"))
        assertTrue(PrivacyEngine.isTracker("https://cdn.segment.com/analytics.js/v1/xyz/analytics.min.js"))

        assertFalse(PrivacyEngine.isTracker("https://en.wikipedia.org/wiki/Privacy"))
        assertFalse(PrivacyEngine.isTracker("https://sarath.ai/search?q=kotlin"))
    }

    @Test
    fun testAdDetection() {
        assertTrue(PrivacyEngine.isAd("https://ad.doubleclick.net/ddm/adj/N1234.site"))
        assertTrue(PrivacyEngine.isAd("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"))
        assertTrue(PrivacyEngine.isAd("https://cdn.taboola.com/libtrc/unip/123/tfa.js"))
        assertTrue(PrivacyEngine.isAd("https://widgets.outbrain.com/outbrain.js"))

        assertFalse(PrivacyEngine.isAd("https://github.com/torvalds/linux"))
        assertFalse(PrivacyEngine.isAd("https://developer.android.com/jetpack/compose"))
    }

    @Test
    fun testPhishingDetection() {
        assertTrue(PrivacyEngine.isPhishingOrMalicious("https://paypa1.com/login"))
        assertTrue(PrivacyEngine.isPhishingOrMalicious("http://bank-login-verify.info/auth"))
        assertTrue(PrivacyEngine.isPhishingOrMalicious("https://free-crypto-giveaway.xyz"))

        assertFalse(PrivacyEngine.isPhishingOrMalicious("https://paypal.com/signin"))
        assertFalse(PrivacyEngine.isPhishingOrMalicious("https://google.com"))
    }

    @Test
    fun testPrivacyScoreComputation() {
        // All shields active + HTTPS
        val fullScore = PrivacyEngine.calculatePrivacyScore(
            trackerBlockerEnabled = true,
            adBlockerEnabled = true,
            cookieProtectionEnabled = true,
            fingerprintProtectionEnabled = true,
            httpsOnlyEnabled = true,
            webRtcProtectionEnabled = true,
            isSecureHttps = true
        )
        assertTrue(fullScore >= 95)

        // Only base protection
        val minScore = PrivacyEngine.calculatePrivacyScore(
            trackerBlockerEnabled = false,
            adBlockerEnabled = false,
            cookieProtectionEnabled = false,
            fingerprintProtectionEnabled = false,
            httpsOnlyEnabled = false,
            webRtcProtectionEnabled = false,
            isSecureHttps = false
        )
        assertEquals(30, minScore)
    }

    @Test
    fun testDomainExtraction() {
        assertEquals("wikipedia.org", PrivacyEngine.extractDomain("https://www.wikipedia.org/wiki/Main_Page"))
        assertEquals("news.ycombinator.com", PrivacyEngine.extractDomain("https://news.ycombinator.com/item?id=123"))
    }

    @Test
    fun testPasswordVaultUnlock() {
        assertFalse(PasswordVaultManager.unlockVault("wrong-pin"))
        assertFalse(PasswordVaultManager.isVaultUnlocked.value)

        assertTrue(PasswordVaultManager.unlockVault("1234"))
        assertTrue(PasswordVaultManager.isVaultUnlocked.value)

        PasswordVaultManager.lockVault()
        assertFalse(PasswordVaultManager.isVaultUnlocked.value)
    }
}
