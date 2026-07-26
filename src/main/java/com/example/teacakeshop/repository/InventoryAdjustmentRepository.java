package com.example.teacakeshop.repository;

import com.example.teacakeshop.entity.InventoryAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryAdjustmentRepository
        extends JpaRepository<InventoryAdjustment, Long> {
}
