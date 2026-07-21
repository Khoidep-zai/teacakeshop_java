package com.example.teacakeshop.service;

import com.example.teacakeshop.entity.RefreshToken;
import com.example.teacakeshop.entity.UserAccount;
import com.example.teacakeshop.exception.UnauthorizedException;
import com.example.teacakeshop.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class RefreshTokenService {

    private static final int TOKEN_BYTE_LENGTH = 64;

    private final RefreshTokenRepository refreshTokenRepository;
    private final SecureRandom secureRandom;
    private final long expirationSeconds;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,

            @Value("${app.jwt.refresh-expiration-seconds}")
            long expirationSeconds
    ) {
        this.refreshTokenRepository =
                refreshTokenRepository;

        this.expirationSeconds =
                expirationSeconds;

        this.secureRandom =
                new SecureRandom();
    }

    @Transactional
    public IssuedRefreshToken issue(
            UserAccount account
    ) {
        cleanupExpired();

        GeneratedToken generated =
                generateUniqueToken();

        RefreshToken entity =
                createEntity(
                        account,
                        generated.hash()
                );

        refreshTokenRepository.save(entity);

        return new IssuedRefreshToken(
                generated.rawToken(),
                expirationSeconds
        );
    }

    /*
     * Thu hồi token cũ và tạo token mới.
     */
    @Transactional
    public RefreshResult rotate(
            String rawToken
    ) {
        String tokenHash =
                hashToken(rawToken);

        RefreshToken current =
                refreshTokenRepository
                        .findByTokenHash(tokenHash)
                        .orElseThrow(() ->
                                new UnauthorizedException(
                                        "Refresh Token không hợp lệ"
                                )
                        );

        UserAccount account =
                current.getUserAccount();

        if (Boolean.TRUE.equals(
                current.getRevoked()
        )) {
            /*
             * Token đã bị thu hồi nhưng vẫn được dùng lại:
             * khóa toàn bộ Refresh Token của tài khoản.
             */
            revokeAll(account.getId());

            throw new UnauthorizedException(
                    "Refresh Token đã bị thu hồi"
            );
        }

        if (current.getExpiresAt()
                .isBefore(Instant.now())) {

            revokeEntity(current);

            throw new UnauthorizedException(
                    "Refresh Token đã hết hạn"
            );
        }

        if (!Boolean.TRUE.equals(
                account.getActive()
        )) {
            revokeAll(account.getId());

            throw new UnauthorizedException(
                    "Tài khoản đã bị khóa"
            );
        }

        GeneratedToken generated =
                generateUniqueToken();

        RefreshToken replacement =
                createEntity(
                        account,
                        generated.hash()
                );

        refreshTokenRepository.save(replacement);

        current.setRevoked(true);
        current.setRevokedAt(Instant.now());
        current.setReplacedByTokenHash(
                generated.hash()
        );

        refreshTokenRepository.save(current);

        return new RefreshResult(
                account,
                generated.rawToken(),
                expirationSeconds
        );
    }

    @Transactional
    public void revoke(
            String rawToken
    ) {
        if (rawToken == null
                || rawToken.isBlank()) {
            return;
        }

        String tokenHash =
                hashToken(rawToken);

        refreshTokenRepository
                .findByTokenHash(tokenHash)
                .ifPresent(this::revokeEntity);
    }

    @Transactional
    public void revokeAll(Long userId) {
        refreshTokenRepository
                .revokeAllActiveByUserId(
                        userId,
                        Instant.now()
                );
    }

    @Transactional
    public void cleanupExpired() {
        refreshTokenRepository
                .deleteByExpiresAtBefore(
                        Instant.now()
                );
    }

    private RefreshToken createEntity(
            UserAccount account,
            String tokenHash
    ) {
        RefreshToken token =
                new RefreshToken();

        token.setUserAccount(account);
        token.setTokenHash(tokenHash);
        token.setRevoked(false);
        token.setCreatedAt(Instant.now());

        token.setExpiresAt(
                Instant.now()
                        .plusSeconds(
                                expirationSeconds
                        )
        );

        return token;
    }

    private void revokeEntity(
            RefreshToken token
    ) {
        if (!Boolean.TRUE.equals(
                token.getRevoked()
        )) {
            token.setRevoked(true);
            token.setRevokedAt(Instant.now());

            refreshTokenRepository.save(token);
        }
    }

    private GeneratedToken generateUniqueToken() {
        String rawToken;
        String tokenHash;

        do {
            byte[] randomBytes =
                    new byte[TOKEN_BYTE_LENGTH];

            secureRandom.nextBytes(randomBytes);

            rawToken =
                    Base64.getUrlEncoder()
                            .withoutPadding()
                            .encodeToString(
                                    randomBytes
                            );

            tokenHash =
                    hashToken(rawToken);

        } while (
                refreshTokenRepository
                        .existsByTokenHash(tokenHash)
        );

        return new GeneratedToken(
                rawToken,
                tokenHash
        );
    }

    private String hashToken(
            String rawToken
    ) {
        try {
            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            byte[] hash =
                    digest.digest(
                            rawToken.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return HexFormat.of()
                    .formatHex(hash);

        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "Không thể tạo SHA-256",
                    exception
            );
        }
    }

    private record GeneratedToken(
            String rawToken,
            String hash
    ) {
    }

    public record IssuedRefreshToken(
            String token,
            long expiresInSeconds
    ) {
    }

    public record RefreshResult(
            UserAccount account,
            String refreshToken,
            long expiresInSeconds
    ) {
    }
}