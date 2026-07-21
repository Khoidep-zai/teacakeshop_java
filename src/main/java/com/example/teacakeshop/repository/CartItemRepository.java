package com.example.teacakeshop.repository;

import com.example.teacakeshop.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository
        extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByIdAndCart_Id(
            Long cartItemId,
            Long cartId
    );

    Optional<CartItem> findByCart_IdAndProduct_Id(
            Long cartId,
            Long productId
    );

    Optional<CartItem> findByCart_IdAndCombo_Id(
            Long cartId,
            Long comboId
    );
}