package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

@Immutable
data class SarathCustomColors(
    val bg: Color,
    val surface: Color,
    val ink: Color,
    val inkMuted: Color,
    val accentGold: Color,
    val accentTeal: Color,
    val border: Color,
    val aiCardTint: Color
)

val LocalSarathColors = staticCompositionLocalOf {
    SarathCustomColors(
        bg = SarathBgLight,
        surface = SarathSurfaceLight,
        ink = SarathInkLight,
        inkMuted = SarathInkMutedLight,
        accentGold = SarathAccentGoldLight,
        accentTeal = SarathAccentTealLight,
        border = SarathBorderLight,
        aiCardTint = SarathAiCardTintLight
    )
}

private val SarathDarkColors = SarathCustomColors(
    bg = SarathBgDark,
    surface = SarathSurfaceDark,
    ink = SarathInkDark,
    inkMuted = SarathInkMutedDark,
    accentGold = SarathAccentGoldDark,
    accentTeal = SarathAccentTealDark,
    border = SarathBorderDark,
    aiCardTint = SarathAiCardTintDark
)

private val SarathLightColors = SarathCustomColors(
    bg = SarathBgLight,
    surface = SarathSurfaceLight,
    ink = SarathInkLight,
    inkMuted = SarathInkMutedLight,
    accentGold = SarathAccentGoldLight,
    accentTeal = SarathAccentTealLight,
    border = SarathBorderLight,
    aiCardTint = SarathAiCardTintLight
)

private val DarkColorScheme = darkColorScheme(
    primary = SarathAccentGoldDark,
    onPrimary = SarathBgDark,
    primaryContainer = SarathAccentGoldDark.copy(alpha = 0.2f),
    onPrimaryContainer = SarathAccentGoldDark,
    secondary = SarathAccentTealDark,
    onSecondary = SarathBgDark,
    secondaryContainer = SarathAccentTealDark.copy(alpha = 0.2f),
    onSecondaryContainer = SarathAccentTealDark,
    background = SarathBgDark,
    onBackground = SarathInkDark,
    surface = SarathSurfaceDark,
    onSurface = SarathInkDark,
    surfaceVariant = SarathSurfaceDark,
    onSurfaceVariant = SarathInkMutedDark,
    outline = SarathBorderDark,
    outlineVariant = SarathBorderDark.copy(alpha = 0.5f)
)

private val LightColorScheme = lightColorScheme(
    primary = SarathAccentGoldLight,
    onPrimary = Color.White,
    primaryContainer = SarathAccentGoldLight.copy(alpha = 0.15f),
    onPrimaryContainer = SarathAccentGoldLight,
    secondary = SarathAccentTealLight,
    onSecondary = Color.White,
    secondaryContainer = SarathAccentTealLight.copy(alpha = 0.15f),
    onSecondaryContainer = SarathAccentTealLight,
    background = SarathBgLight,
    onBackground = SarathInkLight,
    surface = SarathSurfaceLight,
    onSurface = SarathInkLight,
    surfaceVariant = SarathSurfaceLight,
    onSurfaceVariant = SarathInkMutedLight,
    outline = SarathBorderLight,
    outlineVariant = SarathBorderLight.copy(alpha = 0.6f)
)

@Composable
fun SarathSearchTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme: ColorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val customColors = if (darkTheme) SarathDarkColors else SarathLightColors

    CompositionLocalProvider(LocalSarathColors provides customColors) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = Typography,
            content = content
        )
    }
}

// Alias for test compatibility
@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    SarathSearchTheme(darkTheme = darkTheme, content = content)
}
