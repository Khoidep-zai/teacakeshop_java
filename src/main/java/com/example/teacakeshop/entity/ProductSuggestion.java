package com.example.teacakeshop.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "product_suggestions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_product_suggestion_pair",
                        columnNames = {
                                "source_product_id",
                                "suggested_product_id"
                        }
                )
        }
)
public class ProductSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Sản phẩm khách hàng đang xem.
     * Ví dụ: Trà đào cam sả.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "source_product_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_suggestion_source_product"
            )
    )
    private Product sourceProduct;

    /*
     * Sản phẩm được hệ thống gợi ý.
     * Ví dụ: Cheesecake chanh dây.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "suggested_product_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_suggestion_suggested_product"
            )
    )
    private Product suggestedProduct;

    @Column(nullable = false, length = 500)
    private String reason;

    /*
     * Số càng nhỏ thì hiển thị càng trước.
     * Ví dụ:
     * priority = 0: ưu tiên cao nhất
     * priority = 1: ưu tiên thứ hai
     */
    @Column(nullable = false)
    private Integer priority;

    @Column(nullable = false)
    private Boolean active;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (priority == null) {
            priority = 0;
        }

        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public ProductSuggestion() {
    }

    public Long getId() {
        return id;
    }

    public Product getSourceProduct() {
        return sourceProduct;
    }

    public Product getSuggestedProduct() {
        return suggestedProduct;
    }

    public String getReason() {
        return reason;
    }

    public Integer getPriority() {
        return priority;
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

    public void setSourceProduct(Product sourceProduct) {
        this.sourceProduct = sourceProduct;
    }

    public void setSuggestedProduct(Product suggestedProduct) {
        this.suggestedProduct = suggestedProduct;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}