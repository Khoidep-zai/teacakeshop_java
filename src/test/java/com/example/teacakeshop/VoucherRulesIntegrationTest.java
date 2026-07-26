package com.example.teacakeshop;

import com.example.teacakeshop.constant.OrderType;
import com.example.teacakeshop.exception.BadRequestException;
import com.example.teacakeshop.repository.DiscountCampaignRepository;
import com.example.teacakeshop.service.DiscountService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class VoucherRulesIntegrationTest {

    @Autowired
    private DiscountService discountService;

    @Autowired
    private DiscountCampaignRepository campaignRepository;

    @Test
    void seedsFiveCodeRequiredVouchers() {
        assertTrue(campaignRepository.findByCodeIgnoreCase("WELCOME10").orElseThrow().getCodeRequired());
        assertTrue(campaignRepository.findByCodeIgnoreCase("SAVE15").orElseThrow().getCodeRequired());
        assertTrue(campaignRepository.findByCodeIgnoreCase("PICKUP20").orElseThrow().getCodeRequired());
        assertTrue(campaignRepository.findByCodeIgnoreCase("TABLE25").orElseThrow().getCodeRequired());
        assertTrue(campaignRepository.findByCodeIgnoreCase("VIP30").orElseThrow().getCodeRequired());
    }

    @Test
    void welcomeVoucherAppliesTenPercentAtMinimumAmount() {
        var result = discountService.previewVoucher(
                "welcome10",
                new BigDecimal("100000"),
                OrderType.NORMAL
        );

        assertEquals(0, new BigDecimal("10000.00").compareTo(result.discountAmount()));
        assertEquals(0, new BigDecimal("90000.00").compareTo(result.finalAmount()));
    }

    @Test
    void voucherRejectsInsufficientAmountAndWrongOrderType() {
        assertThrows(
                BadRequestException.class,
                () -> discountService.previewVoucher(
                        "SAVE15",
                        new BigDecimal("199999"),
                        OrderType.NORMAL
                )
        );

        assertThrows(
                BadRequestException.class,
                () -> discountService.previewVoucher(
                        "PICKUP20",
                        new BigDecimal("350000"),
                        OrderType.NORMAL
                )
        );

        var result = discountService.previewVoucher(
                "PICKUP20",
                new BigDecimal("350000"),
                OrderType.TAKEAWAY_PREORDER
        );
        assertEquals(0, new BigDecimal("70000.00").compareTo(result.discountAmount()));
    }
}
