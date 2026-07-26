package com.example.teacakeshop.dto.response;

import java.time.LocalDateTime;

public record InventoryAdjustmentResponse(
        Long id,
        Long productId,
        String productName,
        Integer previousQuantity,
        Integer newQuantity,
        Integer quantityChange,
        String note,
        String adjustedBy,
        LocalDateTime createdAt
) {
}
