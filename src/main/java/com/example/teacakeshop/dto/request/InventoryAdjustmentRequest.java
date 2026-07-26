package com.example.teacakeshop.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record InventoryAdjustmentRequest(

        @NotNull(message = "Số lượng tồn không được để trống")
        @PositiveOrZero(message = "Số lượng tồn không được âm")
        Integer stockQuantity,

        @NotBlank(message = "Lý do điều chỉnh không được để trống")
        @Size(max = 500, message = "Lý do điều chỉnh tối đa 500 ký tự")
        String note
) {
}
