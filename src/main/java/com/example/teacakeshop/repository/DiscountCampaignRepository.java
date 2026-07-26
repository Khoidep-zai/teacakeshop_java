package com.example.teacakeshop.repository;

import com.example.teacakeshop.entity.DiscountCampaign;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DiscountCampaignRepository
        extends JpaRepository<DiscountCampaign, Long> {

    boolean existsByCodeIgnoreCase(String code);

    Optional<DiscountCampaign> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(
            String code,
            Long id
    );

    List<DiscountCampaign>
    findByActiveTrueAndStartAtLessThanEqualAndEndAtGreaterThanEqualOrderByPriorityDesc(
            LocalDateTime currentTimeForStart,
            LocalDateTime currentTimeForEnd
    );
}
