package com.example.teacakeshop.dto.response;

import java.time.LocalDateTime;

public record ReservationAvailabilityResponse(

        LocalDateTime reservationTime,

        Integer requestedPeople,

        Integer storeCapacity,

        Integer reservedSeats,

        Integer remainingSeats,

        Boolean available
) {
}