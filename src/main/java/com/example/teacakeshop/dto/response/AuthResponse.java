package com.example.teacakeshop.dto.response;

public record AuthResponse(

        String tokenType,

        String accessToken,

        long expiresInSeconds,

        String refreshToken,

        long refreshTokenExpiresInSeconds,

        UserAccountResponse user
) {
}