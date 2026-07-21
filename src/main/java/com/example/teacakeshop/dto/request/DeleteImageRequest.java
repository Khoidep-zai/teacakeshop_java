package com.example.teacakeshop.dto.request;

import jakarta.validation.constraints.NotBlank;

public record DeleteImageRequest(

        @NotBlank(
                message = "Public ID không được để trống"
        )
        String publicId
) {
}