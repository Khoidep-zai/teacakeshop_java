package com.example.teacakeshop.repository;

import com.example.teacakeshop.constant.CartItemType;
import com.example.teacakeshop.constant.OrderStatus;
import com.example.teacakeshop.entity.OrderItem;
import com.example.teacakeshop.repository.projection.TopSellingItemProjection;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository
        extends JpaRepository<OrderItem, Long> {

    @Query("""
            SELECT
                oi.product.id AS itemId,
                oi.product.name AS itemName,
                SUM(oi.quantity) AS soldQuantity,
                SUM(oi.lineTotal) AS revenue
            FROM OrderItem oi
            WHERE oi.itemType = :itemType
              AND oi.customerOrder.status = :orderStatus
              AND oi.product IS NOT NULL
            GROUP BY
                oi.product.id,
                oi.product.name
            ORDER BY
                SUM(oi.quantity) DESC
            """)
    List<TopSellingItemProjection> findTopSellingProducts(
            @Param("itemType")
            CartItemType itemType,

            @Param("orderStatus")
            OrderStatus orderStatus,

            Pageable pageable
    );

    @Query("""
            SELECT
                oi.combo.id AS itemId,
                oi.combo.name AS itemName,
                SUM(oi.quantity) AS soldQuantity,
                SUM(oi.lineTotal) AS revenue
            FROM OrderItem oi
            WHERE oi.itemType = :itemType
              AND oi.customerOrder.status = :orderStatus
              AND oi.combo IS NOT NULL
            GROUP BY
                oi.combo.id,
                oi.combo.name
            ORDER BY
                SUM(oi.quantity) DESC
            """)
    List<TopSellingItemProjection> findTopSellingCombos(
            @Param("itemType")
            CartItemType itemType,

            @Param("orderStatus")
            OrderStatus orderStatus,

            Pageable pageable
    );
}