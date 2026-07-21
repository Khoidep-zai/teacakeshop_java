package com.example.teacakeshop.dto.response;

import com.example.teacakeshop.constant.CartItemType;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long id,
        CartItemType itemType,
        Long itemId,
        String itemName,
        String imageUrl,
        BigDecimal originalUnitPrice,
        BigDecimal discountAmount,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal lineTotal,
        String discountCode,
        String discountName
) {
}