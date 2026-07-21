package com.example.teacakeshop.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CartResponse(

        String token,

        List<CartItemResponse> items,

        Integer totalQuantity,

        BigDecimal totalAmount,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}