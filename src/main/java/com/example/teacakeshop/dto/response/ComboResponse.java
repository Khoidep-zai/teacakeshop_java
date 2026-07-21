package com.example.teacakeshop.dto.response;

import com.example.teacakeshop.constant.WeatherType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ComboResponse(

        Long id,

        String name,

        String description,

        String imageUrl,

        BigDecimal originalPrice,

        BigDecimal comboPrice,

        BigDecimal savingAmount,

        BigDecimal campaignDiscountAmount,

        BigDecimal finalPrice,

        Long discountCampaignId,

        String discountCampaignName,

        String season,

        WeatherType weatherType,

        Integer soldQuantity,

        Boolean hot,

        Boolean bestSeller,

        Boolean active,

        LocalDate startDate,

        LocalDate endDate,

        LocalDateTime createdAt,

        LocalDateTime updatedAt,

        List<ComboItemResponse> items
) {
}