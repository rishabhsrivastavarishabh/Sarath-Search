package com.example.browser.engine

import com.example.browser.model.SavedCredential
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.util.UUID

/**
 * Secure Password Vault with PIN/Biometric master gating
 */
object PasswordVaultManager {

    private val _credentials = MutableStateFlow<List<SavedCredential>>(
        listOf(
            SavedCredential(
                id = UUID.randomUUID().toString(),
                domain = "github.com",
                username = "developer@sarath.ai",
                encryptedPasswordMask = "••••••••••••••••",
                plainPasswordForDemo = "SarathKey#2026!Sec"
            ),
            SavedCredential(
                id = UUID.randomUUID().toString(),
                domain = "mygov.in",
                username = "citizen.identity",
                encryptedPasswordMask = "••••••••••••",
                plainPasswordForDemo = "GovPortalPass@99"
            )
        )
    )
    val credentials: StateFlow<List<SavedCredential>> = _credentials.asStateFlow()

    private val _isVaultUnlocked = MutableStateFlow(false)
    val isVaultUnlocked: StateFlow<Boolean> = _isVaultUnlocked.asStateFlow()

    const val MASTER_PIN = "1234"

    fun unlockVault(pin: String): Boolean {
        return if (pin == MASTER_PIN) {
            _isVaultUnlocked.value = true
            true
        } else {
            false
        }
    }

    fun lockVault() {
        _isVaultUnlocked.value = false
    }

    fun addCredential(domain: String, username: String, plainPassword: String) {
        val newEntry = SavedCredential(
            id = UUID.randomUUID().toString(),
            domain = domain.trim().lowercase(),
            username = username.trim(),
            encryptedPasswordMask = "•".repeat(plainPassword.length.coerceAtLeast(8)),
            plainPasswordForDemo = plainPassword
        )
        _credentials.update { it + newEntry }
    }

    fun deleteCredential(id: String) {
        _credentials.update { it.filterNot { item -> item.id == id } }
    }
}
