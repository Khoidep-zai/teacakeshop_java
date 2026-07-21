package com.example.teacakeshop.dto.response;

import java.math.BigDecimal;

public record DiscountPriceResponse(
        Long campaignId,
        String campaignCode,
        String campaignName,
        BigDecimal originalPrice,
        BigDecimal discountAmount,
        BigDecimal finalPrice
) {
}