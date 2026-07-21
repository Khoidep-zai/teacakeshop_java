package com.example.teacakeshop.dto.request;

import com.example.teacakeshop.constant.WeatherType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ComboRequest(

        @NotBlank(message = "Tên combo không được để trống")
        @Size(max = 150, message = "Tên combo tối đa 150 ký tự")
        String name,

        String description,

        @Size(max = 500, message = "Đường dẫn ảnh tối đa 500 ký tự")
        String imageUrl,

        @NotNull(message = "Giá combo không được để trống")
        @DecimalMin(
                value = "0.0",
                inclusive = false,
                message = "Giá combo phải lớn hơn 0"
        )
        BigDecimal comboPrice,

        String season,

        @NotNull(message = "Phải chọn loại thời tiết")
        WeatherType weatherType,

        LocalDate startDate,

        LocalDate endDate,

        Boolean hot,

        Boolean bestSeller,

        Boolean active,

        @NotEmpty(message = "Combo phải có sản phẩm")
        List<@Valid ComboItemRequest> items
) {
}