package com.example.teacakeshop.dto.request;

import com.example.teacakeshop.constant.ProductType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProductRequest(

        @NotNull(message = "Phải chọn danh mục")
        Long categoryId,

        @NotBlank(message = "Tên sản phẩm không được để trống")
        @Size(max = 150, message = "Tên sản phẩm tối đa 150 ký tự")
        String name,

        String description,

        @NotNull(message = "Giá sản phẩm không được để trống")
        @DecimalMin(
                value = "0.0",
                inclusive = false,
                message = "Giá sản phẩm phải lớn hơn 0"
        )
        BigDecimal price,

        @Size(max = 500, message = "Đường dẫn ảnh tối đa 500 ký tự")
        String imageUrl,

        @NotNull(message = "Phải chọn loại sản phẩm")
        ProductType productType,

        String taste,

        String temperatureType,

        String season,

        @NotNull(message = "Số lượng tồn không được để trống")
        @PositiveOrZero(message = "Số lượng tồn không được âm")
        Integer stockQuantity,

        Boolean hot,

        Boolean bestSeller,

        Boolean active
) {
}