package com.example.teacakeshop.entity;

import com.example.teacakeshop.constant.PaymentMethod;
import com.example.teacakeshop.constant.PaymentPurpose;
import com.example.teacakeshop.constant.PaymentStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "payments",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_payment_transaction_code",
                        columnNames = "transaction_code"
                )
        },
        indexes = {
                @Index(
                        name = "idx_payment_order",
                        columnList = "order_id"
                ),
                @Index(
                        name = "idx_payment_status",
                        columnList = "status"
                )
        }
)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "order_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_payment_order"
            )
    )
    private CustomerOrder customerOrder;

    @Column(
            name = "transaction_code",
            nullable = false,
            unique = true,
            length = 50
    )
    private String transactionCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentPurpose purpose;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    @Column(
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal amount;

    /*
     * Chỉ có giá trị khi status = PAID.
     */
    private LocalDateTime paidAt;

    @Column(length = 500)
    private String note;

    @Column(
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

        if (status == null) {
            status = PaymentStatus.PENDING;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Payment() {
    }

    public Long getId() {
        return id;
    }

    public CustomerOrder getCustomerOrder() {
        return customerOrder;
    }

    public String getTransactionCode() {
        return transactionCode;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public PaymentPurpose getPurpose() {
        return purpose;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
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

    public void setId(Long id) {
        this.id = id;
    }

    public void setCustomerOrder(
            CustomerOrder customerOrder
    ) {
        this.customerOrder = customerOrder;
    }

    public void setTransactionCode(
            String transactionCode
    ) {
        this.transactionCode = transactionCode;
    }

    public void setPaymentMethod(
            PaymentMethod paymentMethod
    ) {
        this.paymentMethod = paymentMethod;
    }

    public void setPurpose(
            PaymentPurpose purpose
    ) {
        this.purpose = purpose;
    }

    public void setStatus(
            PaymentStatus status
    ) {
        this.status = status;
    }

    public void setAmount(
            BigDecimal amount
    ) {
        this.amount = amount;
    }

    public void setPaidAt(
            LocalDateTime paidAt
    ) {
        this.paidAt = paidAt;
    }

    public void setNote(String note) {
        this.note = note;
    }
}