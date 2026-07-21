package com.example.teacakeshop.controller.admin;

import com.example.teacakeshop.dto.response.*;
import com.example.teacakeshop.service.PaymentService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/payments")
public class AdminPaymentController {

    private final PaymentService paymentService;

    public AdminPaymentController(
            PaymentService paymentService
    ) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public Page<PaymentResponse> getAll(
            @RequestParam(required = false)
            Long orderId,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {
        return paymentService.getAllForAdmin(
                orderId,
                page,
                size
        );
    }

    @GetMapping("/orders/{orderId}")
    public OrderPaymentSummaryResponse
    getOrderPaymentSummary(
            @PathVariable Long orderId
    ) {
        return paymentService
                .getAdminPaymentSummary(orderId);
    }

    @PatchMapping("/{paymentId}/mark-paid")
    public PaymentResponse markCashAsPaid(
            @PathVariable Long paymentId
    ) {
        return paymentService
                .markCashPaymentAsPaid(paymentId);
    }
}