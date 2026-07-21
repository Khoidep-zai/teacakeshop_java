package com.example.teacakeshop.repository;

import com.example.teacakeshop.entity.RefreshToken;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(
            String tokenHash
    );

    boolean existsByTokenHash(
            String tokenHash
    );

    long deleteByExpiresAtBefore(
            Instant currentTime
    );

    @Modifying
    @Query("""
            UPDATE RefreshToken r
            SET r.revoked = true,
                r.revokedAt = :revokedAt
            WHERE r.userAccount.id = :userId
              AND r.revoked = false
            """)
    int revokeAllActiveByUserId(
            @Param("userId")
            Long userId,

            @Param("revokedAt")
            Instant revokedAt
    );
}