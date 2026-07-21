package com.example.teacakeshop.service;

import com.example.teacakeshop.entity.RevokedAccessToken;
import com.example.teacakeshop.repository.RevokedAccessTokenRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class RevokedAccessTokenService {

    private final RevokedAccessTokenRepository repository;

    public RevokedAccessTokenService(
            RevokedAccessTokenRepository repository
    ) {
        this.repository = repository;
    }

    @Transactional
    public void revoke(Jwt jwt) {
        String jti = jwt.getId();
        Instant expiresAt = jwt.getExpiresAt();

        if (jti == null
                || jti.isBlank()
                || expiresAt == null) {
            return;
        }

        repository.deleteByExpiresAtBefore(
                Instant.now()
        );

        if (repository.existsByJti(jti)) {
            return;
        }

        RevokedAccessToken revokedToken =
                new RevokedAccessToken();

        revokedToken.setJti(jti);
        revokedToken.setExpiresAt(expiresAt);
        revokedToken.setRevokedAt(
                Instant.now()
        );

        repository.save(revokedToken);
    }

    @Transactional(readOnly = true)
    public boolean isRevoked(String jti) {
        return jti != null
                && repository.existsByJti(jti);
    }
}