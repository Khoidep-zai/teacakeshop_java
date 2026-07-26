package com.example.teacakeshop.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * Trạng thái nhận đặt bàn dùng chung cho toàn hệ thống.
 *
 * Bảng chỉ có một bản ghi với id = 1 để trạng thái vẫn được giữ
 * sau khi backend khởi động lại.
 */
@Entity
@Table(name = "reservation_booking_control")
public class ReservationBookingControl {

    @Id
    private Long id;

    @Column(
            name = "accepting_reservations",
            nullable = false
    )
    private Boolean acceptingReservations;

    @Column(
            nullable = false,
            length = 1000
    )
    private String message;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    public ReservationBookingControl() {
    }

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Boolean getAcceptingReservations() {
        return acceptingReservations;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setAcceptingReservations(
            Boolean acceptingReservations
    ) {
        this.acceptingReservations = acceptingReservations;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
