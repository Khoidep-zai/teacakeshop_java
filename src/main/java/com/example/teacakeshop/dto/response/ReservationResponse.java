package com.example.teacakeshop.dto.response;

import com.example.teacakeshop.constant.OrderStatus;
import com.example.teacakeshop.constant.ReservationStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReservationResponse(

        Long id,

        String reservationCode,

        String customerName,

        String customerPhone,

        String customerEmail,

        LocalDateTime reservationTime,

        Integer numberOfPeople,

        String note,

        ReservationStatus status,

        Long orderId,

        String orderCode,

        OrderStatus orderStatus,

        BigDecimal orderTotalAmount,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}