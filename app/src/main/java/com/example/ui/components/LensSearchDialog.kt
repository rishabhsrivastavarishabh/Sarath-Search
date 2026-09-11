package com.example.ui.components

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
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
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.CenterFocusWeak
import androidx.compose.material.icons.outlined.PhotoCamera
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ui.theme.LocalSarathColors
import kotlinx.coroutines.delay

data class LensVisualSample(
    val title: String,
    val category: String,
    val iconEmoji: String,
    val detectedQuery: String,
    val description: String,
    val imageUrl: String
)

val LENS_SAMPLES = listOf(
    LensVisualSample(
        title = "India Gate",
        category = "Historical Monument",
        iconEmoji = "🏛️",
        detectedQuery = "India Gate New Delhi architecture timings",
        description = "All India War Memorial archway located astride Kartavya Path, New Delhi.",
        imageUrl = "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&auto=format&fit=crop&q=60"
    ),
    LensVisualSample(
        title = "Vande Bharat Express",
        category = "Transit / Railways",
        iconEmoji = "🚆",
        detectedQuery = "Vande Bharat Express routes timetable bookings",
        description = "Semi-high speed electric multiple unit train operated by Indian Railways.",
        imageUrl = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=60"
    ),
    LensVisualSample(
        title = "UPI Payment QR",
        category = "FinTech / NPCI",
        iconEmoji = "💳",
        detectedQuery = "UPI QR code payments guidelines NPCI",
        description = "Interoperable Bharat QR / Unified Payments Interface scan matrix.",
        imageUrl = "https://images.unsplash.com/photo-1595079672139-625d023f6eb7?w=500&auto=format&fit=crop&q=60"
    ),
    LensVisualSample(
        title = "Sarathi Driving Licence",
        category = "Civic / MoRTH",
        iconEmoji = "📄",
        detectedQuery = "सारथी ड्राइविंग लाइसेंस ऑनलाइन आवेदन स्थिति",
        description = "Ministry of Road Transport and Highways online licensing document portal.",
        imageUrl = "https://images.unsplash.com/photo-1554415707-9e4466a8a4b6?w=500&auto=format&fit=crop&q=60"
    )
)

/**
 * Sarath Lens Dialog
 * Supports capturing via Camera, picking from Gallery (zero-permission photo picker),
 * or testing with rich Indian visual samples. Includes animated HUD laser scan overlay
 * and dual actions (Search with Sarath or Open in Google Lens).
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun LensSearchDialog(
    onDismiss: () -> Unit,
    onExecuteLensSearch: (String) -> Unit
) {
    val colors = LocalSarathColors.current
    val context = LocalContext.current

    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    var capturedBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var selectedSample by remember { mutableStateOf<LensVisualSample?>(null) }
    var isAnalyzing by remember { mutableStateOf(false) }
    var detectionComplete by remember { mutableStateOf(false) }

    // Camera Capture Launcher
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        if (bitmap != null) {
            capturedBitmap = bitmap
            selectedImageUri = null
            selectedSample = null
            isAnalyzing = true
            detectionComplete = false
        }
    }

    // Camera Permission Launcher (Graceful handling for runtime permission)
    val cameraPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            try {
                cameraLauncher.launch(null)
            } catch (e: Exception) {
                Toast.makeText(context, "Camera is unavailable on this device", Toast.LENGTH_SHORT).show()
            }
        } else {
            Toast.makeText(
                context,
                "Camera permission is required to take a photo. You can also pick an image from your gallery.",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    val requestOrLaunchCamera = {
        val permissionCheck = ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA)
        if (permissionCheck == PackageManager.PERMISSION_GRANTED) {
            try {
                cameraLauncher.launch(null)
            } catch (e: Exception) {
                Toast.makeText(context, "Camera is unavailable on this device", Toast.LENGTH_SHORT).show()
            }
        } else {
            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    // Photo Picker Launcher (Android 13+ zero-permission photo picker)
    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri ->
        if (uri != null) {
            selectedImageUri = uri
            capturedBitmap = null
            selectedSample = null
            isAnalyzing = true
            detectionComplete = false
        }
    }

    // Trigger analysis simulation after photo selection
    LaunchedEffect(isAnalyzing) {
        if (isAnalyzing) {
            delay(1300)
            isAnalyzing = false
            detectionComplete = true
        }
    }

    // Scanner beam animation
    val infiniteTransition = rememberInfiniteTransition(label = "laserScan")
    val laserPosition by infiniteTransition.animateFloat(
        initialValue = 0.05f,
        targetValue = 0.95f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1400, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "laserPosition"
    )

    // Helper to launch Google Lens app or web lens search
    val launchGoogleLens = { targetQuery: String ->
        try {
            val lensIntent = Intent(Intent.ACTION_VIEW).apply {
                setPackage("com.google.ar.lens")
            }
            context.startActivity(lensIntent)
        } catch (e: Exception) {
            // Fallback to Google Lens web search
            val webIntent = Intent(
                Intent.ACTION_VIEW,
                Uri.parse("https://www.google.com/search?q=" + Uri.encode(targetQuery))
            )
            context.startActivity(webIntent)
        }
    }

    val activeQuery = selectedSample?.detectedQuery ?: "Visual search result"
    val activeTitle = selectedSample?.title ?: if (capturedBitmap != null) "Captured Photo" else "Selected Photo"
    val activeCategory = selectedSample?.category ?: "Visual Query"
    val activeDescription = selectedSample?.description ?: "Analyzed with Sarath Lens optical recognition pipeline."

    AlertDialog(
        onDismissRequest = onDismiss,
        title = null,
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        WheelSpokeMark(size = 24.dp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Sarath Lens",
                            style = MaterialTheme.typography.titleMedium,
                            color = colors.ink,
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(colors.accentTeal.copy(alpha = 0.15f))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "Visual AI",
                                style = MaterialTheme.typography.labelSmall,
                                color = colors.accentTeal,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = colors.inkMuted)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // If an image is chosen, show the interactive Scanning HUD
                val hasImage = capturedBitmap != null || selectedImageUri != null || selectedSample != null

                if (hasImage) {
                    // Image Container with HUD Reticle and Laser
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color.Black)
                            .border(2.dp, colors.accentGold, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        // The Image Content
                        if (capturedBitmap != null) {
                            Image(
                                bitmap = capturedBitmap!!.asImageBitmap(),
                                contentDescription = "Captured Image",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        } else if (selectedImageUri != null) {
                            AsyncImage(
                                model = selectedImageUri,
                                contentDescription = "Selected Image",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        } else if (selectedSample != null) {
                            AsyncImage(
                                model = selectedSample!!.imageUrl,
                                contentDescription = selectedSample!!.title,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        }

                        // Scanning HUD Overlay
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(Color.Black.copy(alpha = 0.15f))
                        )

                        // Laser Beam (animating during analysis or standby)
                        if (isAnalyzing) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .align(Alignment.TopCenter)
                                    .padding(top = (200 * laserPosition).dp)
                                    .height(3.dp)
                                    .background(
                                        Brush.horizontalGradient(
                                            listOf(
                                                Color.Transparent,
                                                colors.accentGold,
                                                Color.White,
                                                colors.accentTeal,
                                                Color.Transparent
                                            )
                                        )
                                    )
                            )
                        }

                        // HUD Corner brackets
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.CenterFocusWeak,
                                contentDescription = null,
                                tint = colors.accentGold,
                                modifier = Modifier
                                    .size(36.dp)
                                    .align(Alignment.Center)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    if (isAnalyzing) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(18.dp),
                                color = colors.accentTeal,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Sarath Lens is analyzing visual features...",
                                style = MaterialTheme.typography.bodySmall,
                                color = colors.accentTeal,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    } else if (detectionComplete) {
                        // Detected Result Card
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .border(1.dp, colors.accentTeal.copy(alpha = 0.3f), RoundedCornerShape(10.dp)),
                            colors = CardDefaults.cardColors(containerColor = colors.surface)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = activeTitle,
                                        style = MaterialTheme.typography.titleMedium,
                                        color = colors.ink,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .background(colors.accentGold.copy(alpha = 0.18f))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = activeCategory,
                                            style = MaterialTheme.typography.labelSmall,
                                            color = colors.accentGold,
                                            fontWeight = FontWeight.SemiBold,
                                            fontSize = 10.sp
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(4.dp))

                                Text(
                                    text = activeDescription,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = colors.inkMuted,
                                    lineHeight = 18.sp
                                )

                                Spacer(modifier = Modifier.height(12.dp))

                                // Dual Actions: Search with Sarath OR Open with Lens
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Button(
                                        onClick = {
                                            onExecuteLensSearch(activeQuery)
                                            onDismiss()
                                        },
                                        modifier = Modifier.weight(1f).testTag("lens_search_sarath_button"),
                                        colors = ButtonDefaults.buttonColors(containerColor = colors.accentTeal),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Icon(Icons.Default.Search, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Search Sarath", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }

                                    OutlinedButton(
                                        onClick = { launchGoogleLens(activeQuery) },
                                        modifier = Modifier.weight(1f).testTag("lens_open_google_button"),
                                        shape = RoundedCornerShape(8.dp),
                                        border = androidx.compose.foundation.BorderStroke(1.dp, colors.accentGold)
                                    ) {
                                        Icon(Icons.AutoMirrored.Filled.OpenInNew, contentDescription = null, tint = colors.accentGold, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Google Lens", color = colors.accentGold, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    HorizontalDivider(color = colors.border)
                    Spacer(modifier = Modifier.height(10.dp))
                }

                // Input Source Buttons (Camera / Gallery)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .background(colors.surface)
                            .border(1.dp, colors.border, RoundedCornerShape(12.dp))
                            .clickable { requestOrLaunchCamera() }
                            .padding(vertical = 12.dp)
                            .testTag("lens_take_photo_button"),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.CameraAlt, contentDescription = null, tint = colors.accentGold, modifier = Modifier.size(24.dp))
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Take Photo", style = MaterialTheme.typography.labelMedium, color = colors.ink)
                        }
                    }

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .background(colors.surface)
                            .border(1.dp, colors.border, RoundedCornerShape(12.dp))
                            .clickable {
                                photoPickerLauncher.launch(
                                    PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                                )
                            }
                            .padding(vertical = 12.dp)
                            .testTag("lens_pick_gallery_button"),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.Image, contentDescription = null, tint = colors.accentTeal, modifier = Modifier.size(24.dp))
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Choose Image", style = MaterialTheme.typography.labelMedium, color = colors.ink)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Pre-loaded Sample Visuals
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.QrCodeScanner,
                        contentDescription = null,
                        tint = colors.accentTeal,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Or test with Indian visual subjects:",
                        style = MaterialTheme.typography.labelSmall,
                        color = colors.inkMuted,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                FlowRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    LENS_SAMPLES.forEach { sample ->
                        val isSelected = selectedSample == sample
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSelected) colors.accentTeal.copy(alpha = 0.15f) else colors.surface)
                                .border(1.dp, if (isSelected) colors.accentTeal else colors.border, RoundedCornerShape(10.dp))
                                .clickable {
                                    selectedSample = sample
                                    capturedBitmap = null
                                    selectedImageUri = null
                                    isAnalyzing = true
                                    detectionComplete = false
                                }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                                .testTag("lens_sample_${sample.title}")
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(sample.iconEmoji, fontSize = 14.sp)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = sample.title,
                                    style = MaterialTheme.typography.labelMedium,
                                    color = if (isSelected) colors.accentTeal else colors.ink,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                )
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close", color = colors.inkMuted)
            }
        },
        containerColor = colors.surface,
        shape = RoundedCornerShape(20.dp)
    )
}
