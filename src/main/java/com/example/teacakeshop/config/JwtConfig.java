package com.example.teacakeshop.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Configuration
public class JwtConfig {

    /*
     * Chuyển chuỗi Base64 trong application.properties
     * thành SecretKey dùng cho HS256.
     */
    @Bean
    public SecretKey jwtSecretKey(
            @Value("${app.jwt.secret:MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMw==}")
            String encodedSecret
    ) {
        byte[] keyBytes;

        try {
            keyBytes = Base64
                    .getDecoder()
                    .decode(encodedSecret);

        } catch (IllegalArgumentException exception) {
            keyBytes = Base64.getDecoder().decode("MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMw==");
        }

        if (keyBytes.length < 32) {
            keyBytes = Base64.getDecoder().decode("MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMw==");
        }

        return new SecretKeySpec(
                keyBytes,
                "HmacSHA256"
        );
    }

    /*
     * Dùng để tạo Access Token.
     */
    @Bean
    public JwtEncoder jwtEncoder(
            SecretKey jwtSecretKey
    ) {
        JWKSource<SecurityContext> jwkSource =
                new ImmutableSecret<>(
                        jwtSecretKey
                );

        return new NimbusJwtEncoder(
                jwkSource
        );
    }

    /*
     * Dùng để kiểm tra:
     * - chữ ký JWT
     * - issuer
     * - thời hạn
     * - trạng thái thu hồi token
     */
    @Bean
    public JwtDecoder jwtDecoder(
            SecretKey jwtSecretKey,

            @Value("${app.jwt.issuer}")
            String issuer,

            JwtRevocationValidator revocationValidator
    ) {
        NimbusJwtDecoder decoder =
                NimbusJwtDecoder
                        .withSecretKey(jwtSecretKey)
                        .macAlgorithm(
                                MacAlgorithm.HS256
                        )
                        .build();

        OAuth2TokenValidator<Jwt> issuerValidator =
                JwtValidators
                        .createDefaultWithIssuer(
                                issuer
                        );

        OAuth2TokenValidator<Jwt> combinedValidator =
                new DelegatingOAuth2TokenValidator<>(
                        issuerValidator,
                        revocationValidator
                );

        decoder.setJwtValidator(
                combinedValidator
        );

        return decoder;
    }
}