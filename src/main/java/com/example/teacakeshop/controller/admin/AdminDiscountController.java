package com.example.teacakeshop.controller.admin;

import com.example.teacakeshop.dto.request.DiscountCampaignRequest;
import com.example.teacakeshop.dto.response.DiscountCampaignResponse;
import com.example.teacakeshop.service.DiscountService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/discounts")
public class AdminDiscountController {

    private final DiscountService discountService;

    public AdminDiscountController(
            DiscountService discountService
    ) {
        this.discountService = discountService;
    }

    @GetMapping
    public Page<DiscountCampaignResponse> getAll(
            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {
        return discountService.getAllForAdmin(
                page,
                size
        );
    }

    @GetMapping("/{id}")
    public DiscountCampaignResponse getById(
            @PathVariable Long id
    ) {
        return discountService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DiscountCampaignResponse create(
            @Valid
            @RequestBody
            DiscountCampaignRequest request
    ) {
        return discountService.create(request);
    }

    @PutMapping("/{id}")
    public DiscountCampaignResponse update(
            @PathVariable Long id,

            @Valid
            @RequestBody
            DiscountCampaignRequest request
    ) {
        return discountService.update(
                id,
                request
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(
            @PathVariable Long id
    ) {
        discountService.deactivate(id);
    }
}