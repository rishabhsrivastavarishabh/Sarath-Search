package com.example.ui.components

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.WarningAmber
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.LocalSarathColors

/**
 * Error boundary handler interface to report or catch errors from children composables.
 */
class ErrorBoundaryState {
    var hasError by mutableStateOf(false)
    var error: Throwable? by mutableStateOf(null)
    var errorMessage: String? by mutableStateOf(null)
    var errorComponent: String by mutableStateOf("")

    fun catchError(throwable: Throwable, componentName: String = "Component") {
        error = throwable
        errorMessage = throwable.localizedMessage ?: "An unexpected error occurred."
        errorComponent = componentName
        hasError = true
    }

    fun catchMessage(message: String, componentName: String = "Component") {
        errorMessage = message
        error = RuntimeException(message)
        errorComponent = componentName
        hasError = true
    }

    fun reset() {
        hasError = false
        error = null
        errorMessage = null
        errorComponent = ""
    }
}

val LocalErrorBoundary = compositionLocalOf { ErrorBoundaryState() }

/**
 * Compose Error Boundary
 * Emulates React Error Boundaries in Jetpack Compose to catch errors,
 * handle API/UI failures gracefully, and provide fallback UI with retry capability.
 */
@Composable
fun ErrorBoundary(
    componentName: String = "Application View",
    onRetry: (() -> Unit)? = null,
    errorMessage: String? = null,
    error: Throwable? = null,
    modifier: Modifier = Modifier,
    fallback: (@Composable (error: Throwable, onReset: () -> Unit) -> Unit)? = null,
    content: @Composable () -> Unit
) {
    val errorState = remember { ErrorBoundaryState() }

    LaunchedEffect(errorMessage, error) {
        if (!errorMessage.isNullOrBlank()) {
            errorState.catchMessage(errorMessage, componentName)
        } else if (error != null) {
            errorState.catchError(error, componentName)
        }
    }

    CompositionLocalProvider(LocalErrorBoundary provides errorState) {
        if (errorState.hasError) {
            val caughtError = errorState.error ?: RuntimeException(errorState.errorMessage ?: "An unexpected error occurred")
            if (fallback != null) {
                fallback(caughtError) {
                    errorState.reset()
                    onRetry?.invoke()
                }
            } else {
                DefaultErrorFallback(
                    componentName = errorState.errorComponent.ifEmpty { componentName },
                    errorMessage = errorState.errorMessage,
                    error = caughtError,
                    onReset = {
                        errorState.reset()
                        onRetry?.invoke()
                    },
                    modifier = modifier
                )
            }
        } else {
            content()
        }
    }
}

@Composable
fun DefaultErrorFallback(
    componentName: String,
    errorMessage: String? = null,
    error: Throwable? = null,
    onReset: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalSarathColors.current
    val displayMessage = errorMessage ?: error?.localizedMessage ?: "A transient rendering or network issue occurred."

    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(12.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(colors.surface)
            .border(1.dp, colors.accentGold.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
            .padding(16.dp)
            .testTag("error_boundary_fallback")
    ) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.WarningAmber,
                    contentDescription = null,
                    tint = colors.accentGold,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = "Unable to load $componentName",
                    style = MaterialTheme.typography.titleSmall,
                    color = colors.ink,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = displayMessage,
                style = MaterialTheme.typography.bodySmall,
                color = colors.inkMuted,
                lineHeight = 18.sp
            )

            Spacer(modifier = Modifier.height(14.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = onReset,
                    colors = ButtonDefaults.buttonColors(containerColor = colors.accentTeal),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.testTag("error_boundary_retry_button")
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Try Again", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = onReset,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Dismiss", color = colors.inkMuted, fontSize = 12.sp)
                }
            }
        }
    }
}
