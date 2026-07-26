package com.example.teacakeshop.dto.request;

import jakarta.validation.constraints.NotNull;

public record ReservationBookingControlRequest(

        @NotNull(message = "Trạng thái nhận đặt bàn không được để trống")
        Boolean acceptingReservations
) {
}
