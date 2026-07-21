package com.example.teacakeshop.repository;

import com.example.teacakeshop.entity.ProductSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductSuggestionRepository
        extends JpaRepository<ProductSuggestion, Long> {

    List<ProductSuggestion>
    findBySourceProduct_IdAndActiveTrueOrderByPriorityAscCreatedAtDesc(
            Long sourceProductId
    );

    boolean existsBySourceProduct_IdAndSuggestedProduct_Id(
            Long sourceProductId,
            Long suggestedProductId
    );

    boolean existsBySourceProduct_IdAndSuggestedProduct_IdAndIdNot(
            Long sourceProductId,
            Long suggestedProductId,
            Long currentSuggestionId
    );
}