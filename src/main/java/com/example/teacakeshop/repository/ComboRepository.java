package com.example.teacakeshop.repository;

import com.example.teacakeshop.constant.WeatherType;
import com.example.teacakeshop.entity.Combo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface ComboRepository extends JpaRepository<Combo, Long>,
        JpaSpecificationExecutor<Combo> {

    boolean existsByNameIgnoreCase(String name);

    Optional<Combo> findByNameIgnoreCase(String name);

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
