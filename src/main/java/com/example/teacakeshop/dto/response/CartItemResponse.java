package com.example.teacakeshop.dto.response;

import com.example.teacakeshop.constant.CartItemType;

import java.math.BigDecimal;

public record CartItemResponse(
        Long id,
        CartItemType itemType,
        Long itemId,
        String itemName,
        String imageUrl,
        Integer quantity,
        BigDecimal originalUnitPrice,
        BigDecimal discountAmountPerUnit,
        BigDecimal unitPrice,
        BigDecimal lineTotal,
        Integer availableQuantity,
        Long discountCampaignId,
        String discountCampaignName
) {
}