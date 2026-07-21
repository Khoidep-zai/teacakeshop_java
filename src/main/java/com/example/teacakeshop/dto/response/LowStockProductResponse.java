package com.example.teacakeshop.dto.response;

public record LowStockProductResponse(

        Long productId,

        String productName,

        Long categoryId,

        String categoryName,

        Integer stockQuantity,

        Boolean active
) {
}