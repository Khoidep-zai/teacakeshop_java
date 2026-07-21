package com.example.teacakeshop.repository;

import com.example.teacakeshop.entity.ComboItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComboItemRepository
        extends JpaRepository<ComboItem, Long> {
}