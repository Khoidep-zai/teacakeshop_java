package com.example.teacakeshop.dto.response;

import com.example.teacakeshop.constant.OrderStatus;
import com.example.teacakeshop.constant.OrderType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(

        Long id,

        String orderCode,

        String customerName,

        String customerPhone,

        String customerEmail,

        String shippingAddress,

        OrderType orderType,

        OrderStatus status,

        BigDecimal totalAmount,

        String voucherCode,

        String voucherName,

        BigDecimal voucherDiscountAmount,

        Boolean depositRequired,

        BigDecimal depositAmount,

        BigDecimal remainingAmount,

        LocalDateTime pickupTime,

        String note,

        LocalDateTime createdAt,

        LocalDateTime updatedAt,

        List<OrderItemResponse> items
) {
}
