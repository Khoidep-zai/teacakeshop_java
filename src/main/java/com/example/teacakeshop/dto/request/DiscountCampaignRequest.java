package com.example.teacakeshop.dto.request;

import com.example.teacakeshop.constant.DiscountScope;
import com.example.teacakeshop.constant.DiscountType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DiscountCampaignRequest(

        @NotBlank(message = "Mã khuyến mãi không được để trống")
        @Pattern(
                regexp = "^[A-Za-z0-9_-]{3,50}$",
                message = "Mã chỉ gồm chữ, số, dấu gạch ngang hoặc gạch dưới"
        )
        String code,

        @NotBlank(message = "Tên chương trình không được để trống")
        @Size(
                max = 150,
                message = "Tên chương trình tối đa 150 ký tự"
        )
        String name,

        @Size(
                max = 1000,
                message = "Mô tả tối đa 1000 ký tự"
        )
        String description,

        @NotNull(message = "Loại giảm giá không được để trống")
        DiscountType discountType,

        @NotNull(message = "Giá trị giảm không được để trống")
        @DecimalMin(
                value = "0.01",
                message = "Giá trị giảm phải lớn hơn 0"
        )
        BigDecimal discountValue,

        @DecimalMin(
                value = "0.01",
                message = "Mức giảm tối đa phải lớn hơn 0"
        )
        BigDecimal maximumDiscountAmount,

        @NotNull(message = "Phạm vi giảm giá không được để trống")
        DiscountScope discountScope,

        Long categoryId,

        Long productId,

        Long comboId,

        @PositiveOrZero(
                message = "Độ ưu tiên không được âm"
        )
        Integer priority,

        Boolean active,

        @NotNull(message = "Thời gian bắt đầu không được để trống")
        LocalDateTime startAt,

        @NotNull(message = "Thời gian kết thúc không được để trống")
        LocalDateTime endAt
) {
}