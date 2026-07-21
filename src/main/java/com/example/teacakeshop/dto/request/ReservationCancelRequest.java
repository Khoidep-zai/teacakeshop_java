package com.example.teacakeshop.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ReservationCancelRequest(

        @NotBlank(message = "Số điện thoại không được để trống")
        @Pattern(
                regexp = "^[0-9+\\s]{9,15}$",
                message = "Số điện thoại không hợp lệ"
        )
        String customerPhone
) {
}