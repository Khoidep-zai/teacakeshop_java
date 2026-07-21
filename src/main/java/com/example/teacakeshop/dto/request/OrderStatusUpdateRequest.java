package com.example.teacakeshop.dto.request;

import com.example.teacakeshop.constant.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record OrderStatusUpdateRequest(

        @NotNull(message = "Trạng thái không được để trống")
        OrderStatus status
) {
}