package com.example.teacakeshop.repository;

import com.example.teacakeshop.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByTokenAndActiveTrue(String token);

    boolean existsByToken(String token);
}