package com.example.teacakeshop.controller.publicapi;

import com.example.teacakeshop.dto.response.*;
import com.example.teacakeshop.service.DiscountService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discounts")
public class PublicDiscountController {

    private final DiscountService discountService;

    public PublicDiscountController(
            DiscountService discountService
    ) {
        this.discountService = discountService;
    }

    @GetMapping("/active")
    public List<DiscountCampaignResponse>
    getActiveCampaigns() {
        return discountService.getActiveCampaigns();
    }

    @GetMapping("/price/products/{productId}")
    public DiscountPriceResponse getProductPrice(
            @PathVariable Long productId
    ) {
        return discountService
                .calculateProductPrice(productId);
    }

    @GetMapping("/price/combos/{comboId}")
    public DiscountPriceResponse getComboPrice(
            @PathVariable Long comboId
    ) {
        return discountService
                .calculateComboPrice(comboId);
    }
}