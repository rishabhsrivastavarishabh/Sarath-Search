# Sarath Privacy Browser & Search

A modern, production-ready, privacy-focused Web Browser and Search Engine for Android built with Kotlin, Jetpack Compose, and Material Design 3.

---

## Architecture Overview

The browser follows a modular, secure-by-default architecture:

```
Browser Core
├── Tab Manager (BrowserTabManager.kt)
│   ├── Tab State & Lifecycle
│   ├── Container Tab Isolation (Personal, Work, Dev, Private)
│   └── Bookmarks & History
├── Privacy Engine (PrivacyEngine.kt)
│   ├── Tracker Blocker (EasyPrivacy lists)
│   ├── Ad Blocker (EasyList rules)
│   ├── Anti-Fingerprinting Shield (Canvas, WebGL, AudioContext, Hardware noise)
│   ├── Cookie Partitioning & Isolation
│   ├── HTTPS Enforcement (HTTPS-Only Mode)
│   └── Dynamic Privacy Score Calculator
├── Security Engine
│   ├── Safe Browsing / Deceptive Site Interceptor
│   ├── Granular Site & Global Permissions Manager
│   ├── WebRTC Protection (Neutralizes STUN/TURN IP leaks)
│   ├── Secure DNS (DoH: Cloudflare 1.1.1.1, Google 8.8.8.8, Quad9 9.9.9.9)
│   └── Password Vault (PIN-gated encrypted local storage)
└── User Interface (com.example.browser.ui)
    ├── Chrome-Style Omnibox & Navigation Bar
    ├── Privacy Shield Dialog (Website Privacy Report)
    ├── Privacy Dashboard (Live telemetry, scores, and one-tap data wipe)
    ├── Multi-Tab Switcher (Container identity cards & incognito controls)
    ├── Password Manager Vault
    └── Comprehensive Settings Page (Privacy, Permissions, Security)
```

---

## Core Privacy Features

1. **Private Browsing (Incognito Windows)**:
   - Dedicated in-memory sessions that do not persist history.
   - Automatically purges cookies, cache, local storage, and WebStorage upon closing private tabs.
   - Distinct dark private window indicator with container identity tagging.

2. **Built-in Ad & Tracker Blocker**:
   - High-performance, zero-latency in-memory pattern matching covering advertising networks (DoubleClick, GoogleSyndication, Taboola, Outbrain, Criteo) and tracking telemetry (Google Analytics, Clarity, Hotjar, Segment, Facebook Pixels).
   - Per-site whitelist support and live blocked counter badge directly inside the Omnibox.

3. **Anti-Fingerprinting Protections**:
   - Injected JavaScript shields neutralize Canvas hash enumeration by injecting randomized subtle noise into `toDataURL` and `getImageData`.
   - WebGL renderer masking standardizes GPU vendor (`Sarath Privacy Engine`) and unmasked renderer values.
   - AudioContext normalization prevents acoustic fingerprinting.
   - Hardware concurrency (`navigator.hardwareConcurrency = 4`) and memory attributes are normalized to common baseline values.

4. **Cookie Isolation & Storage Partitioning**:
   - Third-party cookies blocked by default across all web views.
   - Partitioned storage boundaries between websites preventing cross-site state tracking.

5. **HTTPS Enforcement & Network Security**:
   - Automatic upgrading of unencrypted `http://` URLs.
   - Warnings before opening insecure connections.
   - Mixed-content blocking (`MIXED_CONTENT_NEVER_ALLOW`).
   - WebRTC IP leak neutralization blocking STUN peer candidate enumeration.

6. **System-Wide Default Browser Integration**:
   - Registered in `AndroidManifest.xml` with `ACTION_VIEW`, `CATEGORY_DEFAULT`, `CATEGORY_BROWSABLE` for HTTP/HTTPS and HTML MIME types.
   - One-tap intent trigger supporting Android 10+ `RoleManager.ROLE_BROWSER` and Android Settings fallback.

---

## Security & Threat Model

### Threat Vectors Neutralized

| Threat Vector | Protection Mechanism |
|---|---|
| **Cross-Site Tracking** | Blocked 3rd-party cookies, partitioned storage, tracker request interception |
| **Canvas & WebGL Fingerprinting** | Noise injection on `HTMLCanvasElement` & standardized WebGL parameters |
| **STUN/WebRTC IP Harvesting** | Neutralized `RTCPeerConnection` stub preventing IP disclosure |
| **Phishing / Malicious Spoofs** | Safe Browsing interstitial alerting user before navigation |
| **Credential Theft** | Local password vault gated with PIN verification; no plaintext cloud transmission |
| **Insecure WiFi / MitM** | Strict HTTPS enforcement and Certificate warning mechanisms |

### Security Guarantees
- **Zero Profiling**: No telemetry or user browsing records sent to external servers.
- **Client-Side Storage**: Passwords, bookmarks, and site preferences remain on-device.
- **Least-Privilege Permissions**: Granular permission switches per website for Camera, Microphone, Geolocation, and Clipboard.

---

## Performance Optimizations

1. **Non-Blocking Rule Processing**: Tracker and ad pattern checks run synchronously within `shouldInterceptRequest` using pre-compiled hash sets, ensuring sub-millisecond evaluation per network request without blocking UI threads.
2. **Lazy WebView Initialization**: WebView components are constructed on demand and memory is freed when tabs are closed.
3. **Session Cache Eviction**: Background tabs and closed private tabs automatically flush their cache and memory partitions.
4. **Lightweight Compose UI**: Fully declarative Jetpack Compose UI adhering to the 8.dp grid system and Material 3 design standards.

---

## Development & Testing

Run unit tests via Gradle:
```bash
gradle :app:testDebugUnitTest
```

Compile and build the APK:
```bash
gradle :app:assembleDebug
```
