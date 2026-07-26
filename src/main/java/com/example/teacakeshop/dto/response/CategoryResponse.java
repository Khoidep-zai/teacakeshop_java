package com.example.teacakeshop.dto.response;

import java.time.LocalDateTime;

public record CategoryResponse(
        Long id,
        String name,
        String description,
        Boolean active,
        long productCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
