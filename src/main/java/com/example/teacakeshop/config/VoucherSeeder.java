package com.example.teacakeshop.config;

import com.example.teacakeshop.constant.DiscountScope;
import com.example.teacakeshop.constant.DiscountType;
import com.example.teacakeshop.constant.OrderType;
import com.example.teacakeshop.entity.DiscountCampaign;
import com.example.teacakeshop.repository.DiscountCampaignRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class VoucherSeeder implements CommandLineRunner {

    private final DiscountCampaignRepository campaignRepository;

    public VoucherSeeder(
            DiscountCampaignRepository campaignRepository
    ) {
        this.campaignRepository = campaignRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seed(
                "WELCOME10",
                "Voucher chào mừng 10%",
                "Giảm 10% cho mọi loại đơn từ 100.000₫.",
                "10",
                "100000",
                "30000",
                null,
                10
        );
        seed(
                "SAVE15",
                "Voucher tiết kiệm 15%",
                "Giảm 15% cho mọi loại đơn từ 200.000₫.",
                "15",
                "200000",
                "60000",
                null,
                20
        );
        seed(
                "PICKUP20",
                "Voucher tự lấy 20%",
                "Giảm 20% cho đơn đặt trước tự lấy từ 350.000₫.",
                "20",
                "350000",
                "120000",
                OrderType.TAKEAWAY_PREORDER,
                30
        );
        seed(
                "TABLE25",
                "Voucher đặt bàn 25%",
                "Giảm 25% cho đơn combo kết hợp đặt bàn từ 500.000₫.",
                "25",
                "500000",
                "200000",
                OrderType.RESERVATION_COMBO,
                40
        );
        seed(
                "VIP30",
                "Voucher đặt bàn VIP 30%",
                "Giảm 30% cho đơn combo kết hợp đặt bàn từ 800.000₫.",
                "30",
                "800000",
                "350000",
                OrderType.RESERVATION_COMBO,
                50
        );
    }

    private void seed(
            String code,
            String name,
            String description,
            String percentage,
            String minimumOrder,
            String maximumDiscount,
            OrderType requiredOrderType,
            int priority
    ) {
        if (campaignRepository.findByCodeIgnoreCase(code).isPresent()) {
            return;
        }

        DiscountCampaign campaign = new DiscountCampaign();

        campaign.setCode(code);
        campaign.setName(name);
        campaign.setDescription(description);
        campaign.setDiscountType(DiscountType.PERCENTAGE);
        campaign.setDiscountValue(new BigDecimal(percentage));
        campaign.setMaximumDiscountAmount(
                new BigDecimal(maximumDiscount)
        );
        campaign.setCodeRequired(true);
        campaign.setMinimumOrderAmount(
                new BigDecimal(minimumOrder)
        );
        campaign.setRequiredOrderType(requiredOrderType);
        campaign.setDiscountScope(DiscountScope.STORE);
        campaign.setCategory(null);
        campaign.setProduct(null);
        campaign.setCombo(null);
        campaign.setPriority(priority);
        campaign.setActive(true);

        LocalDateTime now = LocalDateTime.now();
        campaign.setStartAt(now.minusDays(1));
        campaign.setEndAt(now.plusYears(1));

        campaignRepository.save(campaign);
    }
}
