package com.example.teacakeshop.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "refresh_tokens",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_refresh_token_hash",
                        columnNames = "token_hash"
                )
        },
        indexes = {
                @Index(
                        name = "idx_refresh_token_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_refresh_token_expires",
                        columnList = "expires_at"
                )
        }
)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_refresh_token_user"
            )
    )
    private UserAccount userAccount;

    @Column(
            name = "token_hash",
            nullable = false,
            unique = true,
            length = 64
    )
    private String tokenHash;

    @Column(
            name = "expires_at",
            nullable = false
    )
    private Instant expiresAt;

    @Column(nullable = false)
    private Boolean revoked;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(
            name = "replaced_by_token_hash",
            length = 64
    )
    private String replacedByTokenHash;

    public RefreshToken() {
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }

        if (revoked == null) {
            revoked = false;
        }
    }

    public Long getId() {
        return id;
    }

    public UserAccount getUserAccount() {
        return userAccount;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Boolean getRevoked() {
        return revoked;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }

    public String getReplacedByTokenHash() {
        return replacedByTokenHash;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserAccount(
            UserAccount userAccount
    ) {
        this.userAccount = userAccount;
    }

    public void setTokenHash(
            String tokenHash
    ) {
        this.tokenHash = tokenHash;
    }

    public void setExpiresAt(
            Instant expiresAt
    ) {
        this.expiresAt = expiresAt;
    }

    public void setRevoked(
            Boolean revoked
    ) {
        this.revoked = revoked;
    }

    public void setCreatedAt(
            Instant createdAt
    ) {
        this.createdAt = createdAt;
    }

    public void setRevokedAt(
            Instant revokedAt
    ) {
        this.revokedAt = revokedAt;
    }

    public void setReplacedByTokenHash(
            String replacedByTokenHash
    ) {
        this.replacedByTokenHash =
                replacedByTokenHash;
    }
}