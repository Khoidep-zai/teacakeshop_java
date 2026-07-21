package com.example.teacakeshop.repository.projection;

import java.math.BigDecimal;

public interface TopSellingItemProjection {

    Long getItemId();

    String getItemName();

    Long getSoldQuantity();

    BigDecimal getRevenue();
}