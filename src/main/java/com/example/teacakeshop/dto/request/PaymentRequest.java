package com.example.teacakeshop.dto.request;

import com.example.teacakeshop.constant.PaymentMethod;
import com.example.teacakeshop.constant.PaymentPurpose;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PaymentRequest(

        @NotNull(message = "ID đơn hàng không được để trống")
        Long orderId,

        @NotBlank(message = "Số điện thoại xác minh đơn hàng không được để trống")
        String customerPhone,

        @NotNull(message = "Phương thức thanh toán không được để trống")
        PaymentMethod paymentMethod,

        @NotNull(message = "Mục đích thanh toán không được để trống")
        PaymentPurpose purpose,

        @Size(
                max = 500,
                message = "Ghi chú tối đa 500 ký tự"
        )
        String note
) {
}
