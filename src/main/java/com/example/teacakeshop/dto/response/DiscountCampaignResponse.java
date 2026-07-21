package com.example.teacakeshop.dto.response;

import com.example.teacakeshop.constant.DiscountScope;
import com.example.teacakeshop.constant.DiscountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DiscountCampaignResponse(

        Long id,

        String code,

        String name,

        String description,

        DiscountType discountType,

        BigDecimal discountValue,

        BigDecimal maximumDiscountAmount,

        DiscountScope discountScope,

        Long categoryId,

        String categoryName,

        Long productId,

        String productName,

        Long comboId,

        String comboName,

        Integer priority,

        Boolean active,

        Boolean currentlyEffective,

        LocalDateTime startAt,

        LocalDateTime endAt,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}