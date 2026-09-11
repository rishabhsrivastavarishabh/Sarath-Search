package com.example.browser.ui

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.browser.engine.PasswordVaultManager
import com.example.ui.theme.LocalSarathColors

/**
 * Secure Password Vault Dialog
 */
@Composable
fun PasswordManagerDialog(
    onDismiss: () -> Unit
) {
    val colors = LocalSarathColors.current
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    val credentials by PasswordVaultManager.credentials.collectAsState()
    val isVaultUnlocked by PasswordVaultManager.isVaultUnlocked.collectAsState()

    var enteredPin by remember { mutableStateOf("") }
    var pinError by remember { mutableStateOf(false) }
    var showAddDialog by remember { mutableStateOf(false) }

    Dialog(
        onDismissRequest = {
            PasswordVaultManager.lockVault()
            onDismiss()
        },
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .background(colors.bg),
            color = colors.bg
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                // Top Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(colors.accentGold.copy(alpha = 0.18f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = null,
                                tint = colors.accentGold,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Secure Password Vault",
                                style = MaterialTheme.typography.titleLarge,
                                color = colors.ink,
                                fontFamily = FontFamily.Serif,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Locally encrypted credentials · Zero cloud exposure",
                                style = MaterialTheme.typography.bodySmall,
                                color = colors.inkMuted,
                                fontSize = 11.sp
                            )
                        }
                    }

                    IconButton(
                        onClick = {
                            PasswordVaultManager.lockVault()
                            onDismiss()
                        }
                    ) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = colors.ink)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (!isVaultUnlocked) {
                    // PIN Authentication Gate
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier
                                .fillMaxWidth(0.85f)
                                .clip(RoundedCornerShape(16.dp))
                                .background(colors.surface)
                                .border(1.dp, colors.border, RoundedCornerShape(16.dp))
                                .padding(20.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = null,
                                tint = colors.accentTeal,
                                modifier = Modifier.size(40.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Unlock Password Vault",
                                style = MaterialTheme.typography.titleMedium,
                                color = colors.ink,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Enter Master PIN (Default: 1234)",
                                style = MaterialTheme.typography.bodySmall,
                                color = colors.inkMuted,
                                fontSize = 12.sp
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            OutlinedTextField(
                                value = enteredPin,
                                onValueChange = {
                                    enteredPin = it
                                    pinError = false
                                },
                                label = { Text("Master PIN") },
                                visualTransformation = PasswordVisualTransformation(),
                                isError = pinError,
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth().testTag("vault_pin_input"),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = colors.accentTeal,
                                    unfocusedBorderColor = colors.border
                                )
                            )

                            if (pinError) {
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("Incorrect Master PIN", color = Color(0xFFC62828), style = MaterialTheme.typography.bodySmall)
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            Button(
                                onClick = {
                                    if (PasswordVaultManager.unlockVault(enteredPin)) {
                                        enteredPin = ""
                                    } else {
                                        pinError = true
                                    }
                                },
                                modifier = Modifier.fillMaxWidth().testTag("vault_unlock_button"),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = colors.accentTeal,
                                    contentColor = Color.White
                                ),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Text("Unlock Credentials", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                } else {
                    // Unlocked Vault View
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Stored Credentials (${credentials.size})",
                            style = MaterialTheme.typography.titleMedium,
                            color = colors.ink,
                            fontWeight = FontWeight.Bold
                        )

                        Button(
                            onClick = { showAddDialog = true },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = colors.accentGold.copy(alpha = 0.2f),
                                contentColor = colors.accentGold
                            ),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.testTag("add_credential_button")
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Add", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    LazyColumn(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(credentials) { cred ->
                            var isRevealed by remember { mutableStateOf(false) }

                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(colors.surface)
                                    .border(1.dp, colors.border, RoundedCornerShape(12.dp))
                                    .padding(14.dp)
                            ) {
                                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = cred.domain,
                                            style = MaterialTheme.typography.titleMedium,
                                            color = colors.accentTeal,
                                            fontWeight = FontWeight.Bold
                                        )
                                        IconButton(
                                            onClick = { PasswordVaultManager.deleteCredential(cred.id) },
                                            modifier = Modifier.size(28.dp)
                                        ) {
                                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFFC62828), modifier = Modifier.size(18.dp))
                                        }
                                    }

                                    Text(
                                        text = "Username: ${cred.username}",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = colors.ink
                                    )

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(
                                            text = "Password: " + if (isRevealed) cred.plainPasswordForDemo else cred.encryptedPasswordMask,
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = colors.inkMuted,
                                            fontFamily = FontFamily.Monospace
                                        )

                                        Row {
                                            IconButton(
                                                onClick = { isRevealed = !isRevealed },
                                                modifier = Modifier.size(28.dp)
                                            ) {
                                                Icon(
                                                    imageVector = if (isRevealed) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                                    contentDescription = "Toggle Visibility",
                                                    tint = colors.accentGold,
                                                    modifier = Modifier.size(18.dp)
                                                )
                                            }

                                            Spacer(modifier = Modifier.width(4.dp))

                                            TextButton(
                                                onClick = {
                                                    clipboardManager.setText(AnnotatedString(cred.plainPasswordForDemo))
                                                    Toast.makeText(context, "Password copied to clipboard", Toast.LENGTH_SHORT).show()
                                                }
                                            ) {
                                                Text("Copy", color = colors.accentTeal, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        var newDomain by remember { mutableStateOf("") }
        var newUsername by remember { mutableStateOf("") }
        var newPassword by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = { Text("Save New Credential", color = colors.ink, fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = newDomain,
                        onValueChange = { newDomain = it },
                        label = { Text("Domain / Website") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = newUsername,
                        onValueChange = { newUsername = it },
                        label = { Text("Username / Email") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = newPassword,
                        onValueChange = { newPassword = it },
                        label = { Text("Password") },
                        visualTransformation = PasswordVisualTransformation(),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newDomain.isNotBlank() && newPassword.isNotBlank()) {
                            PasswordVaultManager.addCredential(newDomain, newUsername, newPassword)
                            showAddDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = colors.accentTeal)
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) {
                    Text("Cancel", color = colors.inkMuted)
                }
            },
            containerColor = colors.bg
        )
    }
}
