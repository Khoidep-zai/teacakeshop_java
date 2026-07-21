package com.example.teacakeshop.dto.response;

import com.example.teacakeshop.constant.OrderStatus;
import com.example.teacakeshop.constant.OrderType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderSummaryResponse(

        Long id,

        String orderCode,

        String customerName,

        String customerPhone,

        OrderType orderType,

        OrderStatus status,

        BigDecimal totalAmount,

        Boolean depositRequired,

        BigDecimal depositAmount,

        BigDecimal remainingAmount,

        LocalDateTime pickupTime,

        LocalDateTime createdAt
) {
}