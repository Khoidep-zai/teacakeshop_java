package com.example.teacakeshop.dto.response;

import java.math.BigDecimal;

public record ComboItemResponse(
        Long id,
        Long productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal
) {
}