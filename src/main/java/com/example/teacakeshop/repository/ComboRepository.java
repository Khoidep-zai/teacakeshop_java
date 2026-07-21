package com.example.teacakeshop.repository;

import com.example.teacakeshop.constant.WeatherType;
import com.example.teacakeshop.entity.Combo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComboRepository extends JpaRepository<Combo, Long> {

    boolean existsByNameIgnoreCase(String name);

    Page<Combo> findByActiveTrue(Pageable pageable);

    Page<Combo> findByActiveTrueAndNameContainingIgnoreCase(
            String keyword,
            Pageable pageable
    );

    List<Combo> findTop6ByActiveTrueAndHotTrueOrderByCreatedAtDesc();

    List<Combo> findTop6ByActiveTrueAndBestSellerTrueOrderBySoldQuantityDesc();

    List<Combo> findTop6ByActiveTrueOrderBySoldQuantityDesc();

    List<Combo> findTop6ByActiveTrueOrderByCreatedAtDesc();

    List<Combo> findByActiveTrueAndWeatherTypeOrderBySoldQuantityDesc(
            WeatherType weatherType
    );
}