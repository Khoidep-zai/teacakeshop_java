package com.example.teacakeshop.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "revoked_access_tokens",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_revoked_access_token_jti",
                        columnNames = "jti"
                )
        },
        indexes = {
                @Index(
                        name = "idx_revoked_access_token_expires",
                        columnList = "expires_at"
                )
        }
)
public class RevokedAccessToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * JWT ID của Access Token.
     */
    @Column(
            nullable = false,
            unique = true,
            length = 100
    )
    private String jti;

    @Column(
            name = "expires_at",
            nullable = false
    )
    private Instant expiresAt;

    @Column(
            name = "revoked_at",
            nullable = false
    )
    private Instant revokedAt;

    public RevokedAccessToken() {
    }

    @PrePersist
    public void prePersist() {
        if (revokedAt == null) {
            revokedAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getJti() {
        return jti;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setJti(String jti) {
        this.jti = jti;
    }

    public void setExpiresAt(
            Instant expiresAt
    ) {
        this.expiresAt = expiresAt;
    }

    public void setRevokedAt(
            Instant revokedAt
    ) {
        this.revokedAt = revokedAt;
    }
}