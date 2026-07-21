package com.example.teacakeshop.dto.response;

import com.example.teacakeshop.constant.CartItemType;

import java.math.BigDecimal;

public record TopSellingItemResponse(

        Long itemId,

        String itemName,

        CartItemType itemType,

        Long soldQuantity,

        BigDecimal revenue
) {
}