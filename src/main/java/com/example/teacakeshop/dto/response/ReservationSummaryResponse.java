package com.example.teacakeshop.dto.response;

import com.example.teacakeshop.constant.ReservationStatus;

import java.time.LocalDateTime;

public record ReservationSummaryResponse(

        Long id,

        String reservationCode,

        String customerName,

        String customerPhone,

        LocalDateTime reservationTime,

        Integer numberOfPeople,

        ReservationStatus status,

        String orderCode,

        LocalDateTime createdAt
) {
}