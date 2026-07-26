package com.example.teacakeshop.controller.staff;

import com.example.teacakeshop.dto.request.InventoryAdjustmentRequest;
import com.example.teacakeshop.dto.response.InventoryAdjustmentResponse;
import com.example.teacakeshop.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff/inventory")
public class StaffInventoryController {

    private final InventoryService inventoryService;

    public StaffInventoryController(
            InventoryService inventoryService
    ) {
        this.inventoryService = inventoryService;
    }

    @PatchMapping("/products/{productId}")
    public InventoryAdjustmentResponse adjust(
            @PathVariable Long productId,
            @Valid @RequestBody InventoryAdjustmentRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return inventoryService.adjust(
                productId,
                request,
                jwt.getSubject()
        );
    }

    @GetMapping("/adjustments")
    public Page<InventoryAdjustmentResponse> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return inventoryService.getHistory(page, size);
    }
}
