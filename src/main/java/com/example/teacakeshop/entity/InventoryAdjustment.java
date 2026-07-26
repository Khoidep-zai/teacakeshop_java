package com.example.teacakeshop.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "inventory_adjustments",
        indexes = {
                @Index(
                        name = "idx_inventory_adjustment_product",
                        columnList = "product_id"
                ),
                @Index(
                        name = "idx_inventory_adjustment_created",
                        columnList = "created_at"
                )
        }
)
public class InventoryAdjustment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "previous_quantity", nullable = false)
    private Integer previousQuantity;

    @Column(name = "new_quantity", nullable = false)
    private Integer newQuantity;

    @Column(name = "quantity_change", nullable = false)
    private Integer quantityChange;

    @Column(nullable = false, length = 500)
    private String note;

    @Column(name = "adjusted_by", nullable = false, length = 150)
    private String adjustedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public Integer getPreviousQuantity() { return previousQuantity; }
    public Integer getNewQuantity() { return newQuantity; }
    public Integer getQuantityChange() { return quantityChange; }
    public String getNote() { return note; }
    public String getAdjustedBy() { return adjustedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setProduct(Product product) { this.product = product; }
    public void setPreviousQuantity(Integer previousQuantity) { this.previousQuantity = previousQuantity; }
    public void setNewQuantity(Integer newQuantity) { this.newQuantity = newQuantity; }
    public void setQuantityChange(Integer quantityChange) { this.quantityChange = quantityChange; }
    public void setNote(String note) { this.note = note; }
    public void setAdjustedBy(String adjustedBy) { this.adjustedBy = adjustedBy; }
}
