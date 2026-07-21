package com.example.teacakeshop.dto.response;

import com.example.teacakeshop.constant.OrderStatus;
import com.example.teacakeshop.constant.OrderType;

import java.math.BigDecimal;
import java.util.List;

public record OrderPaymentSummaryResponse(

        Long orderId,

        String orderCode,

        OrderType orderType,

        OrderStatus orderStatus,

        BigDecimal totalAmount,

        Boolean depositRequired,

        BigDecimal requiredDepositAmount,

        BigDecimal paidAmount,

        BigDecimal outstandingAmount,

        Boolean fullyPaid,

        List<PaymentResponse> payments
) {
}