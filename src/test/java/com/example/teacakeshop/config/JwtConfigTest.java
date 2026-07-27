package com.example.teacakeshop.config;

import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtConfigTest {

    @Test
    void jwtSecretKeyUsesFallbackWhenConfiguredSecretIsTooShort() {
        JwtConfig config = new JwtConfig();

        SecretKey secretKey = config.jwtSecretKey("12345678");

        assertNotNull(secretKey);
        assertTrue(secretKey.getEncoded().length >= 32);
    }
}
