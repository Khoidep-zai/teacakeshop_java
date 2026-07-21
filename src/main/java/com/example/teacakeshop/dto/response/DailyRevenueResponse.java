package com.example.teacakeshop.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyRevenueResponse(

        LocalDate date,

        BigDecimal revenue,

        long completedOrders
) {
}