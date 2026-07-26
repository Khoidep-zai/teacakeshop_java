package com.example.teacakeshop.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CashOnDeliveryRequest(

        @NotNull(message = "ID đơn hàng không được để trống")
        Long orderId,

        @NotBlank(message = "Số điện thoại xác minh đơn hàng không được để trống")
        String customerPhone,

        @Size(
                max = 500,
                message = "Ghi chú tối đa 500 ký tự"
        )
        String note
) {
}
