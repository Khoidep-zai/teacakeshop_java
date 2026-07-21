package com.example.teacakeshop.controller.admin;

import com.example.teacakeshop.constant.OrderStatus;
import com.example.teacakeshop.dto.request.OrderStatusUpdateRequest;
import com.example.teacakeshop.dto.response.OrderResponse;
import com.example.teacakeshop.dto.response.OrderSummaryResponse;
import com.example.teacakeshop.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(
            OrderService orderService
    ) {
        this.orderService = orderService;
    }

    @GetMapping
    public Page<OrderSummaryResponse> getAll(
            @RequestParam(required = false)
            OrderStatus status,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {
        return orderService.getAllForAdmin(
                status,
                page,
                size
        );
    }

    @GetMapping("/{id}")
    public OrderResponse getById(
            @PathVariable Long id
    ) {
        return orderService.getByIdForAdmin(id);
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(
            @PathVariable Long id,

            @Valid
            @RequestBody
            OrderStatusUpdateRequest request
    ) {
        return orderService.updateStatus(
                id,
                request.status()
        );
    }
}