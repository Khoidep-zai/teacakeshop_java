package com.example.teacakeshop.dto.response;

import com.example.teacakeshop.constant.ProductType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductSuggestionResponse(

        Long id,

        Long sourceProductId,
        String sourceProductName,
        ProductType sourceProductType,

        Long suggestedProductId,
        String suggestedProductName,
        ProductType suggestedProductType,
        String suggestedProductImageUrl,
        BigDecimal suggestedProductPrice,

        String reason,
        Integer priority,
        Boolean active,

        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}