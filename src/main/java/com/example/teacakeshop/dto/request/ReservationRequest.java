package com.example.teacakeshop.dto.request;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record ReservationRequest(

        @NotBlank(message = "Tên khách hàng không được để trống")
        @Size(max = 100)
        String customerName,

        @NotBlank(message = "Số điện thoại không được để trống")
        @Pattern(
                regexp = "^[0-9+\\s]{9,15}$",
                message = "Số điện thoại không hợp lệ"
        )
        String customerPhone,

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        String customerEmail,

        @NotNull(message = "Thời gian đặt bàn không được để trống")
        LocalDateTime reservationTime,

        @NotNull(message = "Số người không được để trống")
        @Min(
                value = 1,
                message = "Số người tối thiểu là 1"
        )
        @Max(
                value = 20,
                message = "Mỗi lần đặt tối đa 20 người"
        )
        Integer numberOfPeople,

        /*
         * Có thể null nếu chỉ đặt bàn.
         */
        Long orderId,

        @Size(
                max = 1000,
                message = "Ghi chú tối đa 1000 ký tự"
        )
        String note
) {
}