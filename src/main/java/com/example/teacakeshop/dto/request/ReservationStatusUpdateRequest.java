package com.example.teacakeshop.dto.request;

import com.example.teacakeshop.constant.ReservationStatus;
import jakarta.validation.constraints.NotNull;

public record ReservationStatusUpdateRequest(

        @NotNull(message = "Trạng thái không được để trống")
        ReservationStatus status
) {
}