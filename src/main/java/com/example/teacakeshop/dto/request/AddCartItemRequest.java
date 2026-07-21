package com.example.teacakeshop.dto.request;

import com.example.teacakeshop.constant.CartItemType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AddCartItemRequest(

        @NotNull(message = "Loại món không được để trống")
        CartItemType itemType,

        @NotNull(message = "ID món không được để trống")
        Long itemId,

        @NotNull(message = "Số lượng không được để trống")
        @Positive(message = "Số lượng phải lớn hơn 0")
        Integer quantity
) {
}