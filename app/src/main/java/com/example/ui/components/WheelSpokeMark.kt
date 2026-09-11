package com.example.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.example.ui.theme.LocalSarathColors

/**
 * The Signature 8-Spoke Wheel Mark ("Sarathi" Charioteer Navigation Wheel)
 * Features 4 cardinal gold spokes, 4 diagonal teal spokes, a metallic outer ring,
 * and a dark center gem with gold bevel.
 * Rotates gently when [isSpinning] is true (while a query is in-flight).
 */
@Composable
fun WheelSpokeMark(
    modifier: Modifier = Modifier,
    size: Dp = 48.dp,
    isSpinning: Boolean = false
) {
    val colors = LocalSarathColors.current

    val infiniteTransition = rememberInfiniteTransition(label = "wheelRotation")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "wheelAngle"
    )

    val currentRotation = if (isSpinning) rotation else 0f

    Box(
        modifier = modifier.size(size),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(size)) {
            val center = Offset(this.size.width / 2f, this.size.height / 2f)
            val radius = this.size.minDimension / 2f

            // 1. Outer metallic circular border
            drawCircle(
                color = colors.accentGold.copy(alpha = 0.45f),
                radius = radius * 0.96f,
                center = center,
                style = Stroke(width = radius * 0.045f)
            )

            // 2. Subtle outer ring track
            drawCircle(
                color = colors.accentTeal.copy(alpha = 0.12f),
                radius = radius * 0.90f,
                center = center,
                style = Stroke(width = radius * 0.02f)
            )

            // Rotate spokes based on search state
            rotate(degrees = currentRotation, pivot = center) {
                // 3. Draw 4 Diagonal Teal Spokes (45°, 135°, 225°, 315°)
                rotate(degrees = 45f, pivot = center) {
                    drawFourSpokes(
                        center = center,
                        radius = radius,
                        spokeColor = colors.accentTeal,
                        spokeLengthRatio = 0.58f,
                        spokeWidthRatio = 0.14f
                    )
                }

                // 4. Draw 4 Cardinal Gold Spokes (0°, 90°, 180°, 270°)
                drawFourSpokes(
                    center = center,
                    radius = radius,
                    spokeColor = colors.accentGold,
                    spokeLengthRatio = 0.62f,
                    spokeWidthRatio = 0.15f
                )

                // 5. Center Hub Outer Gold Bezel
                drawCircle(
                    color = colors.accentGold,
                    radius = radius * 0.28f,
                    center = center
                )

                // 6. Center Hub Inner Ring
                drawCircle(
                    color = colors.accentGold.copy(alpha = 0.85f),
                    radius = radius * 0.23f,
                    center = center
                )

                // 7. Center Hub Dark Core (Glossy Obsidian)
                drawCircle(
                    color = Color(0xFF121D19),
                    radius = radius * 0.17f,
                    center = center
                )

                // 8. Subtle Gem Reflection
                drawCircle(
                    color = Color.White.copy(alpha = 0.7f),
                    radius = radius * 0.045f,
                    center = Offset(center.x - radius * 0.05f, center.y - radius * 0.05f)
                )
            }
        }
    }
}

private fun DrawScope.drawFourSpokes(
    center: Offset,
    radius: Float,
    spokeColor: Color,
    spokeLengthRatio: Float,
    spokeWidthRatio: Float
) {
    val spokeWidth = radius * spokeWidthRatio
    val spokeHalfWidth = spokeWidth / 2f
    val spokeLength = radius * spokeLengthRatio
    val cornerRadius = CornerRadius(spokeHalfWidth, spokeHalfWidth)

    // Top spoke
    drawRoundRect(
        color = spokeColor,
        topLeft = Offset(center.x - spokeHalfWidth, center.y - spokeLength),
        size = Size(spokeWidth, spokeLength - radius * 0.12f),
        cornerRadius = cornerRadius
    )

    // Bottom spoke
    drawRoundRect(
        color = spokeColor,
        topLeft = Offset(center.x - spokeHalfWidth, center.y + radius * 0.12f),
        size = Size(spokeWidth, spokeLength - radius * 0.12f),
        cornerRadius = cornerRadius
    )

    // Left spoke
    drawRoundRect(
        color = spokeColor,
        topLeft = Offset(center.x - spokeLength, center.y - spokeHalfWidth),
        size = Size(spokeLength - radius * 0.12f, spokeWidth),
        cornerRadius = cornerRadius
    )

    // Right spoke
    drawRoundRect(
        color = spokeColor,
        topLeft = Offset(center.x + radius * 0.12f, center.y - spokeHalfWidth),
        size = Size(spokeLength - radius * 0.12f, spokeWidth),
        cornerRadius = cornerRadius
    )
}
