package com.example.teacakeshop.entity;

import com.example.teacakeshop.constant.OrderStatus;
import com.example.teacakeshop.constant.OrderType;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity(name = "CustomerOrder")
@Table(
        name = "orders",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_order_code",
                        columnNames = "order_code"
                )
        },
        indexes = {
                @Index(
                        name = "idx_order_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_order_created_at",
                        columnList = "created_at"
                ),
                @Index(
                        name = "idx_order_user_account",
                        columnList = "user_account_id"
                )
        }
)
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "order_code",
            nullable = false,
            unique = true,
            length = 30
    )
    private String orderCode;

    /*
     * Tài khoản đã tạo đơn hàng.
     *
     * Có thể null để hỗ trợ khách vãng lai.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_account_id",
            foreignKey = @ForeignKey(
                    name = "fk_order_user_account"
            )
    )
    private UserAccount userAccount;

    @Column(
            nullable = false,
            length = 100
    )
    private String customerName;

    @Column(
            nullable = false,
            length = 20
    )
    private String customerPhone;

    @Column(
            nullable = false,
            length = 150
    )
    private String customerEmail;

    @Column(length = 500)
    private String shippingAddress;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private OrderType orderType;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private OrderStatus status;

    @Column(
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal totalAmount;

    @Column(name = "voucher_code", length = 50)
    private String voucherCode;

    @Column(name = "voucher_name", length = 150)
    private String voucherName;

    @Column(
            name = "voucher_discount_amount",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal voucherDiscountAmount;

    /*
     * true với đơn TAKEAWAY_PREORDER.
     */
    @Column(nullable = false)
    private Boolean depositRequired;

    /*
     * Số tiền khách phải cọc.
     */
    @Column(
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal depositAmount;

    /*
     * Số tiền khách còn phải thanh toán.
     */
    @Column(
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal remainingAmount;

    /*
     * Thời gian khách đến lấy hàng.
     * Chỉ dùng cho đơn đặt trước.
     */
    private LocalDateTime pickupTime;

    @Column(columnDefinition = "TEXT")
    private String note;

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

    @OneToMany(
            mappedBy = "customerOrder",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("id ASC")
    private List<OrderItem> items =
            new ArrayList<>();

    public CustomerOrder() {
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = OrderStatus.PENDING;
        }

        if (depositRequired == null) {
            depositRequired = false;
        }

        if (depositAmount == null) {
            depositAmount = BigDecimal.ZERO;
        }

        if (remainingAmount == null) {
            remainingAmount = BigDecimal.ZERO;
        }

        if (totalAmount == null) {
            totalAmount = BigDecimal.ZERO;
        }

        if (voucherDiscountAmount == null) {
            voucherDiscountAmount = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addItem(
            OrderItem item
    ) {
        items.add(item);
        item.setCustomerOrder(this);
    }

    public void removeItem(
            OrderItem item
    ) {
        items.remove(item);
        item.setCustomerOrder(null);
    }

    public Long getId() {
        return id;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public UserAccount getUserAccount() {
        return userAccount;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public OrderType getOrderType() {
        return orderType;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getVoucherCode() {
        return voucherCode;
    }

    public String getVoucherName() {
        return voucherName;
    }

    public BigDecimal getVoucherDiscountAmount() {
        return voucherDiscountAmount;
    }

    public Boolean getDepositRequired() {
        return depositRequired;
    }

    public BigDecimal getDepositAmount() {
        return depositAmount;
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public LocalDateTime getPickupTime() {
        return pickupTime;
    }

    public String getNote() {
        return note;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }

    public void setOrderCode(
            String orderCode
    ) {
        this.orderCode = orderCode;
    }

    public void setUserAccount(
            UserAccount userAccount
    ) {
        this.userAccount = userAccount;
    }

    public void setCustomerName(
            String customerName
    ) {
        this.customerName = customerName;
    }

    public void setCustomerPhone(
            String customerPhone
    ) {
        this.customerPhone = customerPhone;
    }

    public void setCustomerEmail(
            String customerEmail
    ) {
        this.customerEmail = customerEmail;
    }

    public void setShippingAddress(
            String shippingAddress
    ) {
        this.shippingAddress = shippingAddress;
    }

    public void setOrderType(
            OrderType orderType
    ) {
        this.orderType = orderType;
    }

    public void setStatus(
            OrderStatus status
    ) {
        this.status = status;
    }

    public void setTotalAmount(
            BigDecimal totalAmount
    ) {
        this.totalAmount = totalAmount;
    }

    public void setVoucherCode(String voucherCode) {
        this.voucherCode = voucherCode;
    }

    public void setVoucherName(String voucherName) {
        this.voucherName = voucherName;
    }

    public void setVoucherDiscountAmount(
            BigDecimal voucherDiscountAmount
    ) {
        this.voucherDiscountAmount = voucherDiscountAmount;
    }

    public void setDepositRequired(
            Boolean depositRequired
    ) {
        this.depositRequired =
                depositRequired;
    }

    public void setDepositAmount(
            BigDecimal depositAmount
    ) {
        this.depositAmount =
                depositAmount;
    }

    public void setRemainingAmount(
            BigDecimal remainingAmount
    ) {
        this.remainingAmount =
                remainingAmount;
    }

    public void setPickupTime(
            LocalDateTime pickupTime
    ) {
        this.pickupTime = pickupTime;
    }

    public void setNote(
            String note
    ) {
        this.note = note;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt
    ) {
        this.updatedAt = updatedAt;
    }

    public void setItems(
            List<OrderItem> items
    ) {
        this.items.clear();

        if (items != null) {
            items.forEach(this::addItem);
        }
    }
}
