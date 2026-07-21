package com.example.teacakeshop.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProductSuggestionRequest(

        @NotNull(message = "Sản phẩm nguồn không được để trống")
        Long sourceProductId,

        @NotNull(message = "Sản phẩm gợi ý không được để trống")
        Long suggestedProductId,

        @NotBlank(message = "Lý do gợi ý không được để trống")
        @Size(
                max = 500,
                message = "Lý do gợi ý tối đa 500 ký tự"
        )
        String reason,

        @PositiveOrZero(
                message = "Độ ưu tiên không được là số âm"
        )
        Integer priority,

        Boolean active
) {
}