package com.example.teacakeshop.dto.response;

import com.example.teacakeshop.constant.ProductType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(

        Long id,

        Long categoryId,

        String categoryName,

        String name,

        String description,

        BigDecimal price,

        BigDecimal discountAmount,

        BigDecimal finalPrice,

        Long discountCampaignId,

        String discountCampaignName,

        String imageUrl,

        ProductType productType,

        String taste,

        String temperatureType,

        String season,

        Integer stockQuantity,

        Integer soldQuantity,

        Boolean hot,

        Boolean bestSeller,

        Boolean active,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}