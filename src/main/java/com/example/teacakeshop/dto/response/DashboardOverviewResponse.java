package com.example.teacakeshop.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DashboardOverviewResponse(

        BigDecimal totalRevenue,

        BigDecimal todayRevenue,

        BigDecimal monthRevenue,

        long totalOrders,

        long todayOrders,

        long pendingOrders,

        long confirmedOrders,

        long preparingOrders,

        long completedOrders,

        long cancelledOrders,

        long totalReservations,

        long todayReservations,

        long pendingReservations,

        long confirmedReservations,

        long seatedReservations,

        long completedReservations,

        long cancelledReservations,

        long noShowReservations,

        long activeProducts,

        long lowStockProducts,

        LocalDateTime generatedAt
) {
}