package com.example.teacakeshop.entity;

import com.example.teacakeshop.constant.ReservationStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "reservations",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_reservation_code",
                        columnNames = "reservation_code"
                ),
                @UniqueConstraint(
                        name = "uk_reservation_order",
                        columnNames = "order_id"
                )
        },
        indexes = {
                @Index(
                        name = "idx_reservation_time",
                        columnList = "reservation_time"
                ),
                @Index(
                        name = "idx_reservation_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_reservation_user_account",
                        columnList = "user_account_id"
                )
        }
)
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "reservation_code",
            nullable = false,
            unique = true,
            length = 30
    )
    private String reservationCode;

    /*
     * Tài khoản đã tạo lịch đặt bàn.
     *
     * Có thể null để hỗ trợ khách vãng lai.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_account_id",
            foreignKey = @ForeignKey(
                    name = "fk_reservation_user_account"
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

    @Column(nullable = false)
    private LocalDateTime reservationTime;

    @Column(nullable = false)
    private Integer numberOfPeople;

    @Column(length = 1000)
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private ReservationStatus status;

    /*
     * Có thể null nếu khách chỉ đặt bàn.
     *
     * Nếu khách đặt combo dùng tại cửa hàng,
     * reservation sẽ liên kết với đơn RESERVATION_COMBO.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "order_id",
            unique = true,
            foreignKey = @ForeignKey(
                    name = "fk_reservation_order"
            )
    )
    private CustomerOrder customerOrder;

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

    public Reservation() {
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = ReservationStatus.PENDING;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getReservationCode() {
        return reservationCode;
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

    public LocalDateTime getReservationTime() {
        return reservationTime;
    }

    public Integer getNumberOfPeople() {
        return numberOfPeople;
    }

    public String getNote() {
        return note;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public CustomerOrder getCustomerOrder() {
        return customerOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }

    public void setReservationCode(
            String reservationCode
    ) {
        this.reservationCode = reservationCode;
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

    public void setReservationTime(
            LocalDateTime reservationTime
    ) {
        this.reservationTime = reservationTime;
    }

    public void setNumberOfPeople(
            Integer numberOfPeople
    ) {
        this.numberOfPeople = numberOfPeople;
    }

    public void setNote(
            String note
    ) {
        this.note = note;
    }

    public void setStatus(
            ReservationStatus status
    ) {
        this.status = status;
    }

    public void setCustomerOrder(
            CustomerOrder customerOrder
    ) {
        this.customerOrder = customerOrder;
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
}