package com.example.ui.components

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.LocalSarathColors
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState

/**
 * Sarath Voice Search Dialog
 * Integrates Android's SpeechRecognizer engine with continuous listening,
 * live audio RMS amplitude tracking, Accompanist permission management,
 * bilingual (en-IN / hi-IN) models, and graceful intent fallback.
 */
@OptIn(ExperimentalLayoutApi::class, ExperimentalPermissionsApi::class)
@Composable
fun VoiceSearchDialog(
    onDismiss: () -> Unit,
    onVoiceResult: (String) -> Unit
) {
    val colors = LocalSarathColors.current
    val context = LocalContext.current

    var selectedVoiceLanguage by remember { mutableStateOf("en-IN") } // "en-IN" or "hi-IN"
    var isListening by remember { mutableStateOf(false) }
    var recognizedQuery by remember { mutableStateOf("") }
    var livePartialText by remember { mutableStateOf("") }
    var speechRmsLevel by remember { mutableFloatStateOf(0f) }

    val audioPermissionState = rememberPermissionState(Manifest.permission.RECORD_AUDIO)

    // Fallback system Speech Launcher
    val fallbackSpeechLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK && result.data != null) {
            val spokenResults = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
            val topSpoken = spokenResults?.firstOrNull()?.trim()
            if (!topSpoken.isNullOrEmpty()) {
                recognizedQuery = topSpoken
                onVoiceResult(topSpoken)
            } else {
                Toast.makeText(context, "No speech detected. Please try again.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    val launchFallbackIntent = {
        try {
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_WEB_SEARCH)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, selectedVoiceLanguage)
                putExtra(RecognizerIntent.EXTRA_PROMPT, if (selectedVoiceLanguage == "hi-IN") "सारथी सर्च — बोलिए..." else "Sarath Search — Listening...")
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
            }
            fallbackSpeechLauncher.launch(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "Voice recognizer: tap any spoken prompt below", Toast.LENGTH_LONG).show()
        }
    }

    // Android SpeechRecognizer instance
    var speechRecognizer by remember { mutableStateOf<SpeechRecognizer?>(null) }

    val startListeningWithSpeechRecognizer: () -> Unit = {
        if (!SpeechRecognizer.isRecognitionAvailable(context)) {
            launchFallbackIntent()
        } else {
            try {
                speechRecognizer?.destroy()
                val recognizer = SpeechRecognizer.createSpeechRecognizer(context)
                speechRecognizer = recognizer

                val recognizerIntent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_WEB_SEARCH)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, selectedVoiceLanguage)
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                }

                recognizer.setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(params: Bundle?) {
                        isListening = true
                        livePartialText = ""
                    }

                    override fun onBeginningOfSpeech() {
                        isListening = true
                    }

                    override fun onRmsChanged(rmsdB: Float) {
                        speechRmsLevel = rmsdB.coerceIn(0f, 10f)
                    }

                    override fun onBufferReceived(buffer: ByteArray?) {}

                    override fun onEndOfSpeech() {
                        isListening = false
                    }

                    override fun onError(error: Int) {
                        isListening = false
                        // If error occurred (e.g. timeout or no match), fallback to intent if user taps
                        if (error == SpeechRecognizer.ERROR_NO_MATCH) {
                            Toast.makeText(context, "No speech recognized. Tap to retry.", Toast.LENGTH_SHORT).show()
                        }
                    }

                    override fun onResults(results: Bundle?) {
                        isListening = false
                        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        val topMatch = matches?.firstOrNull()?.trim()
                        if (!topMatch.isNullOrEmpty()) {
                            recognizedQuery = topMatch
                            onVoiceResult(topMatch)
                        }
                    }

                    override fun onPartialResults(partialResults: Bundle?) {
                        val partialMatches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        val partial = partialMatches?.firstOrNull()?.trim()
                        if (!partial.isNullOrEmpty()) {
                            livePartialText = partial
                        }
                    }

                    override fun onEvent(eventType: Int, params: Bundle?) {}
                })

                recognizer.startListening(recognizerIntent)
            } catch (e: Exception) {
                launchFallbackIntent()
            }
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            try {
                speechRecognizer?.destroy()
            } catch (e: Exception) {
                // ignore
            }
        }
    }

    val requestOrStartVoice: () -> Unit = {
        if (audioPermissionState.status.isGranted) {
            startListeningWithSpeechRecognizer()
        } else {
            audioPermissionState.launchPermissionRequest()
        }
    }

    // Auto-start listening if permission already granted
    LaunchedEffect(audioPermissionState.status.isGranted) {
        if (audioPermissionState.status.isGranted) {
            startListeningWithSpeechRecognizer()
        }
    }

    // Pulsing animation for microphone listener
    val infiniteTransition = rememberInfiniteTransition(label = "pulseAnimation")
    val baseScale by infiniteTransition.animateFloat(
        initialValue = 1.0f,
        targetValue = 1.25f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 850, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "micPulse"
    )

    val dynamicScale = if (isListening) (baseScale + (speechRmsLevel * 0.03f)).coerceAtMost(1.45f) else 1.0f

    val sampleVoiceQueries = if (selectedVoiceLanguage == "hi-IN") {
        listOf(
            "सारथी ड्राइविंग लाइसेंस ऑनलाइन",
            "वंदे भारत ट्रेन समय सारिणी",
            "यूपीआई पेमेंट लिमिट क्या है",
            "आधार कार्ड डाउनलोड कैसे करें"
        )
    } else {
        listOf(
            "UPI transaction limits 2026",
            "Vande Bharat sleeper routes",
            "Sarathi driving licence renewal",
            "Digital Rupee RBI guidelines"
        )
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = null,
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header with close button
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        WheelSpokeMark(size = 24.dp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Voice Search",
                            style = MaterialTheme.typography.titleMedium,
                            color = colors.ink,
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close Voice Search", tint = colors.inkMuted)
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Language toggle (English / हिंदी)
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(if (selectedVoiceLanguage == "en-IN") colors.accentTeal else colors.surface)
                            .border(1.dp, if (selectedVoiceLanguage == "en-IN") colors.accentTeal else colors.border, RoundedCornerShape(16.dp))
                            .clickable {
                                selectedVoiceLanguage = "en-IN"
                                if (isListening) startListeningWithSpeechRecognizer()
                            }
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = "English (India)",
                            style = MaterialTheme.typography.labelSmall,
                            color = if (selectedVoiceLanguage == "en-IN") Color.White else colors.ink,
                            fontWeight = FontWeight.SemiBold
                        )
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(if (selectedVoiceLanguage == "hi-IN") colors.accentTeal else colors.surface)
                            .border(1.dp, if (selectedVoiceLanguage == "hi-IN") colors.accentTeal else colors.border, RoundedCornerShape(16.dp))
                            .clickable {
                                selectedVoiceLanguage = "hi-IN"
                                if (isListening) startListeningWithSpeechRecognizer()
                            }
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = "हिंदी (भारत)",
                            style = MaterialTheme.typography.labelSmall,
                            color = if (selectedVoiceLanguage == "hi-IN") Color.White else colors.ink,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(26.dp))

                // Pulsing Mic Sphere
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .scale(dynamicScale)
                        .clip(CircleShape)
                        .background(colors.accentGold.copy(alpha = if (isListening) 0.22f else 0.12f)),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .clip(CircleShape)
                            .background(if (isListening) colors.accentGold else colors.accentTeal)
                            .clickable { requestOrStartVoice() }
                            .testTag("voice_mic_trigger"),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isListening) Icons.Default.GraphicEq else Icons.Default.Mic,
                            contentDescription = if (isListening) "Listening active" else "Tap to speak",
                            tint = Color.White,
                            modifier = Modifier.size(36.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Live partial transcript or status
                Text(
                    text = if (livePartialText.isNotEmpty()) {
                        "“$livePartialText”"
                    } else if (isListening) {
                        if (selectedVoiceLanguage == "hi-IN") "सुन रहे हैं... बोलिए" else "Listening... Speak now"
                    } else {
                        "Tap the microphone to speak"
                    },
                    style = MaterialTheme.typography.titleMedium,
                    color = colors.ink,
                    fontWeight = FontWeight.SemiBold,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite }
                )

                Text(
                    text = if (isListening) "Bilingual speech recognition active" else "Powered by Android SpeechRecognizer",
                    style = MaterialTheme.typography.bodySmall,
                    color = colors.inkMuted,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Quick Spoken Suggestions (Instant tap to test)
                Text(
                    text = "Or tap to search a spoken phrase:",
                    style = MaterialTheme.typography.labelSmall,
                    color = colors.inkMuted,
                    fontWeight = FontWeight.Medium
                )

                Spacer(modifier = Modifier.height(8.dp))

                FlowRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    sampleVoiceQueries.forEach { phrase ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(colors.surface)
                                .border(1.dp, colors.accentTeal.copy(alpha = 0.35f), RoundedCornerShape(12.dp))
                                .clickable { onVoiceResult(phrase) }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.VolumeUp,
                                    contentDescription = null,
                                    tint = colors.accentTeal,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = phrase,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = colors.accentTeal,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = colors.inkMuted)
            }
        },
        containerColor = colors.surface,
        shape = RoundedCornerShape(20.dp)
    )
}
