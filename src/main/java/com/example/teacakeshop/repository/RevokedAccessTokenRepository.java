package com.example.teacakeshop.repository;

import com.example.teacakeshop.entity.RevokedAccessToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;

public interface RevokedAccessTokenRepository
        extends JpaRepository<RevokedAccessToken, Long> {

    boolean existsByJti(String jti);

    long deleteByExpiresAtBefore(
            Instant currentTime
    );
}