package com.example.teacakeshop.dto.response;

import com.example.teacakeshop.constant.OrderType;

import java.math.BigDecimal;

public record VoucherPreviewResponse(
        Long campaignId,
        String code,
        String name,
        BigDecimal orderAmount,
        BigDecimal discountAmount,
        BigDecimal finalAmount,
        BigDecimal minimumOrderAmount,
        OrderType requiredOrderType
) {
}
