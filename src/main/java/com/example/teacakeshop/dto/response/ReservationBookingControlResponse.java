package com.example.teacakeshop.dto.response;

import java.time.LocalDateTime;

public record ReservationBookingControlResponse(
        boolean acceptingReservations,
        String message,
        LocalDateTime updatedAt
) {
}
