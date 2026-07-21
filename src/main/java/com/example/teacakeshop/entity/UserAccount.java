package com.example.teacakeshop.entity;

import com.example.teacakeshop.constant.Role;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_accounts",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_account_email",
                        columnNames = "email"
                ),
                @UniqueConstraint(
                        name = "uk_user_account_phone",
                        columnNames = "phone"
                )
        },
        indexes = {
                @Index(
                        name = "idx_user_account_role",
                        columnList = "role"
                ),
                @Index(
                        name = "idx_user_account_active",
                        columnList = "active"
                )
        }
)
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "full_name",
            nullable = false,
            length = 120
    )
    private String fullName;

    @Column(
            nullable = false,
            unique = true,
            length = 150
    )
    private String email;

    @Column(
            unique = true,
            length = 20
    )
    private String phone;

    @Column(
            name = "password_hash",
            nullable = false,
            length = 100
    )
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private Role role;

    @Column(nullable = false)
    private Boolean active;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    public UserAccount() {
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (role == null) {
            role = Role.CUSTOMER;
        }

        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public Role getRole() {
        return role;
    }

    public Boolean getActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setPasswordHash(
            String passwordHash
    ) {
        this.passwordHash = passwordHash;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}