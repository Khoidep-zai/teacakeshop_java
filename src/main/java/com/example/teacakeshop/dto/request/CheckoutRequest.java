package com.example.teacakeshop.dto.request;

import com.example.teacakeshop.constant.OrderType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CheckoutRequest(

        @NotBlank(message = "Token giỏ hàng không được để trống")
        String cartToken,

        @NotBlank(message = "Tên khách hàng không được để trống")
        @Size(
                max = 100,
                message = "Tên khách hàng tối đa 100 ký tự"
        )
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

        String shippingAddress,

        @NotNull(message = "Loại đơn hàng không được để trống")
        OrderType orderType,

        LocalDateTime pickupTime,

        @Size(max = 50, message = "Mã voucher tối đa 50 ký tự")
        String voucherCode,

        @Size(
                max = 1000,
                message = "Ghi chú tối đa 1000 ký tự"
        )
        String note
) {
}
