package com.example.teacakeshop.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "carts",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_cart_token",
                        columnNames = "token"
                )
        }
)
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Token dùng để xác định giỏ hàng của khách chưa đăng nhập.
     */
    @Column(nullable = false, unique = true, length = 64)
    private String token;

    /*
     * Sau khi checkout, giỏ có thể được chuyển active = false.
     */
    @Column(nullable = false)
    private Boolean active;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(
            mappedBy = "cart",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("createdAt ASC")
    private List<CartItem> items = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Cart() {
    }

    public void addItem(CartItem item) {
        items.add(item);
        item.setCart(this);
        touch();
    }

    public void removeItem(CartItem item) {
        items.remove(item);
        touch();
    }

    public void clearItems() {
        items.clear();
        touch();
    }

    public void touch() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getToken() {
        return token;
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

    public List<CartItem> getItems() {
        return items;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}