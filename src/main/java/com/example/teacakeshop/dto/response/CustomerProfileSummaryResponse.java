package com.example.teacakeshop.dto.response;

public record CustomerProfileSummaryResponse(

        UserAccountResponse user,

        long totalOrders,

        long totalReservations
) {
}