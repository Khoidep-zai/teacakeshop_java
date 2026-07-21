package com.example.teacakeshop.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "cart_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_cart_item_cart")
    )
    private Cart cart;

    /*
     * Có giá trị khi dòng giỏ hàng là sản phẩm lẻ.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "product_id",
            foreignKey = @ForeignKey(name = "fk_cart_item_product")
    )
    private Product product;

    /*
     * Có giá trị khi dòng giỏ hàng là combo.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "combo_id",
            foreignKey = @ForeignKey(name = "fk_cart_item_combo")
    )
    private Combo combo;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public CartItem() {
    }

    public Long getId() {
        return id;
    }

    public Cart getCart() {
        return cart;
    }

    public Product getProduct() {
        return product;
    }

    public Combo getCombo() {
        return combo;
    }

    public Integer getQuantity() {
        return quantity;
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

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public void setCombo(Combo combo) {
        this.combo = combo;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}