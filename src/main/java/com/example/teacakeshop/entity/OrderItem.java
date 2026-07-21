package com.example.teacakeshop.entity;

import com.example.teacakeshop.constant.CartItemType;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "order_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_order_item_order"
            )
    )
    private CustomerOrder customerOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CartItemType itemType;

    /*
     * Có giá trị khi khách mua sản phẩm riêng.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "product_id",
            foreignKey = @ForeignKey(
                    name = "fk_order_item_product"
            )
    )
    private Product product;

    /*
     * Có giá trị khi khách mua combo.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "combo_id",
            foreignKey = @ForeignKey(
                    name = "fk_order_item_combo"
            )
    )
    private Combo combo;

    /*
     * Lưu tên tại thời điểm đặt hàng.
     * Nếu admin đổi tên sản phẩm sau này,
     * đơn hàng cũ vẫn giữ nguyên tên cũ.
     */
    @Column(
            name = "item_name",
            nullable = false,
            length = 150
    )
    private String itemName;

    @Column(
            name = "image_url",
            length = 500
    )
    private String imageUrl;

    /*
     * Giá gốc trước khuyến mãi.
     *
     * Không đặt nullable = false để tương thích
     * với những đơn hàng đã tạo trước module Discount.
     */
    @Column(
            name = "original_unit_price",
            precision = 12,
            scale = 2
    )
    private BigDecimal originalUnitPrice;

    /*
     * Số tiền được giảm trên một sản phẩm/combo.
     *
     * Ví dụ:
     * originalUnitPrice = 45.000
     * discountAmount    = 7.000
     * unitPrice         = 38.000
     */
    @Column(
            name = "discount_amount",
            precision = 12,
            scale = 2
    )
    private BigDecimal discountAmount;

    /*
     * Mã chương trình khuyến mãi tại thời điểm đặt hàng.
     */
    @Column(
            name = "discount_code",
            length = 50
    )
    private String discountCode;

    /*
     * Tên chương trình khuyến mãi tại thời điểm đặt hàng.
     */
    @Column(
            name = "discount_name",
            length = 150
    )
    private String discountName;

    /*
     * Giá thực tế khách phải trả sau khuyến mãi.
     */
    @Column(
            name = "unit_price",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private Integer quantity;

    /*
     * lineTotal = unitPrice × quantity
     */
    @Column(
            name = "line_total",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal lineTotal;

    public OrderItem() {
    }

    public Long getId() {
        return id;
    }

    public CustomerOrder getCustomerOrder() {
        return customerOrder;
    }

    public CartItemType getItemType() {
        return itemType;
    }

    public Product getProduct() {
        return product;
    }

    public Combo getCombo() {
        return combo;
    }

    public String getItemName() {
        return itemName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public BigDecimal getOriginalUnitPrice() {
        return originalUnitPrice;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public String getDiscountCode() {
        return discountCode;
    }

    public String getDiscountName() {
        return discountName;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getLineTotal() {
        return lineTotal;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setCustomerOrder(
            CustomerOrder customerOrder
    ) {
        this.customerOrder = customerOrder;
    }

    public void setItemType(
            CartItemType itemType
    ) {
        this.itemType = itemType;
    }

    public void setProduct(
            Product product
    ) {
        this.product = product;
    }

    public void setCombo(
            Combo combo
    ) {
        this.combo = combo;
    }

    public void setItemName(
            String itemName
    ) {
        this.itemName = itemName;
    }

    public void setImageUrl(
            String imageUrl
    ) {
        this.imageUrl = imageUrl;
    }

    public void setOriginalUnitPrice(
            BigDecimal originalUnitPrice
    ) {
        this.originalUnitPrice = originalUnitPrice;
    }

    public void setDiscountAmount(
            BigDecimal discountAmount
    ) {
        this.discountAmount = discountAmount;
    }

    public void setDiscountCode(
            String discountCode
    ) {
        this.discountCode = discountCode;
    }

    public void setDiscountName(
            String discountName
    ) {
        this.discountName = discountName;
    }

    public void setUnitPrice(
            BigDecimal unitPrice
    ) {
        this.unitPrice = unitPrice;
    }

    public void setQuantity(
            Integer quantity
    ) {
        this.quantity = quantity;
    }

    public void setLineTotal(
            BigDecimal lineTotal
    ) {
        this.lineTotal = lineTotal;
    }
}