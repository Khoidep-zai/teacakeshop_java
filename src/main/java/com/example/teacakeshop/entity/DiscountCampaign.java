package com.example.teacakeshop.entity;

import com.example.teacakeshop.constant.DiscountScope;
import com.example.teacakeshop.constant.DiscountType;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "discount_campaigns",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_discount_campaign_code",
                        columnNames = "code"
                )
        },
        indexes = {
                @Index(
                        name = "idx_discount_campaign_time",
                        columnList = "start_at,end_at"
                ),
                @Index(
                        name = "idx_discount_campaign_active",
                        columnList = "active"
                )
        }
)
public class DiscountCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            nullable = false,
            unique = true,
            length = 50
    )
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "discount_type",
            nullable = false,
            length = 30
    )
    private DiscountType discountType;

    /*
     * PERCENTAGE:
     * 10 nghĩa là giảm 10%.
     *
     * FIXED_AMOUNT:
     * 10000 nghĩa là giảm 10.000 đồng.
     */
    @Column(
            name = "discount_value",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal discountValue;

    /*
     * Giới hạn tiền giảm tối đa.
     * Chủ yếu dùng với giảm phần trăm.
     *
     * Ví dụ:
     * giảm 20%, tối đa 30.000 đồng.
     */
    @Column(
            name = "maximum_discount_amount",
            precision = 12,
            scale = 2
    )
    private BigDecimal maximumDiscountAmount;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "discount_scope",
            nullable = false,
            length = 30
    )
    private DiscountScope discountScope;

    /*
     * Chỉ có giá trị khi scope = CATEGORY.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "category_id",
            foreignKey = @ForeignKey(
                    name = "fk_discount_category"
            )
    )
    private Category category;

    /*
     * Chỉ có giá trị khi scope = PRODUCT.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "product_id",
            foreignKey = @ForeignKey(
                    name = "fk_discount_product"
            )
    )
    private Product product;

    /*
     * Chỉ có giá trị khi scope = COMBO.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "combo_id",
            foreignKey = @ForeignKey(
                    name = "fk_discount_combo"
            )
    )
    private Combo combo;

    /*
     * Nếu hai chương trình giảm bằng nhau,
     * chương trình priority lớn hơn được chọn.
     */
    @Column(nullable = false)
    private Integer priority;

    @Column(nullable = false)
    private Boolean active;

    @Column(
            name = "start_at",
            nullable = false
    )
    private LocalDateTime startAt;

    @Column(
            name = "end_at",
            nullable = false
    )
    private LocalDateTime endAt;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
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

    public DiscountCampaign() {
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public BigDecimal getMaximumDiscountAmount() {
        return maximumDiscountAmount;
    }

    public DiscountScope getDiscountScope() {
        return discountScope;
    }

    public Category getCategory() {
        return category;
    }

    public Product getProduct() {
        return product;
    }

    public Combo getCombo() {
        return combo;
    }

    public Integer getPriority() {
        return priority;
    }

    public Boolean getActive() {
        return active;
    }

    public LocalDateTime getStartAt() {
        return startAt;
    }

    public LocalDateTime getEndAt() {
        return endAt;
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

    public void setCode(String code) {
        this.code = code;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public void setMaximumDiscountAmount(
            BigDecimal maximumDiscountAmount
    ) {
        this.maximumDiscountAmount =
                maximumDiscountAmount;
    }

    public void setDiscountScope(
            DiscountScope discountScope
    ) {
        this.discountScope = discountScope;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public void setCombo(Combo combo) {
        this.combo = combo;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public void setStartAt(LocalDateTime startAt) {
        this.startAt = startAt;
    }

    public void setEndAt(LocalDateTime endAt) {
        this.endAt = endAt;
    }
}