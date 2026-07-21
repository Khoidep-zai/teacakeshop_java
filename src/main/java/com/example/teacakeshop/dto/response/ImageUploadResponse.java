package com.example.teacakeshop.dto.response;

public record ImageUploadResponse(

        String publicId,

        String imageUrl,

        String format,

        Long size,

        Integer width,

        Integer height
) {
}