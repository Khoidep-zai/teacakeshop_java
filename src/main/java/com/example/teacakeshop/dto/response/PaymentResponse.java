package com.example.teacakeshop.dto.response;

import com.example.teacakeshop.constant.PaymentMethod;
import com.example.teacakeshop.constant.PaymentPurpose;
import com.example.teacakeshop.constant.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(

        Long id,

        Long orderId,

        String orderCode,

        String transactionCode,

        PaymentMethod paymentMethod,

        PaymentPurpose purpose,

        PaymentStatus status,

        BigDecimal amount,

        BigDecimal orderTotalAmount,

        BigDecimal paidAmount,

        BigDecimal outstandingAmount,

        LocalDateTime paidAt,

        String note,

        LocalDateTime createdAt
) {
}