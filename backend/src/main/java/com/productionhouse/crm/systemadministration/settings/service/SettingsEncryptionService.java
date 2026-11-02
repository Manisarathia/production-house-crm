package com.productionhouse.crm.systemadministration.settings.service;

import com.productionhouse.crm.auth.api.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Base64;

@Service
public class SettingsEncryptionService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int IV_BYTES = 12;

    private final String configuredKey;

    public SettingsEncryptionService(@Value("${crm.settings.encryption-key:}") String configuredKey) {
        this.configuredKey = configuredKey;
    }

    public String encrypt(String value) {
        if (configuredKey == null || configuredKey.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Sensitive settings require CRM_SETTINGS_ENCRYPTION_KEY (at least 32 UTF-8 bytes).");
        }
        try {
            byte[] iv = new byte[IV_BYTES];
            RANDOM.nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key(), new GCMParameterSpec(128, iv));
            byte[] encrypted = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
            byte[] payload = Arrays.copyOf(iv, iv.length + encrypted.length);
            System.arraycopy(encrypted, 0, payload, iv.length, encrypted.length);
            return Base64.getEncoder().encodeToString(payload);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Could not encrypt sensitive setting.", exception);
        }
    }

    private SecretKeySpec key() throws GeneralSecurityException {
        byte[] keyBytes = MessageDigest.getInstance("SHA-256")
                .digest(configuredKey.getBytes(StandardCharsets.UTF_8));
        return new SecretKeySpec(keyBytes, "AES");
    }
}
