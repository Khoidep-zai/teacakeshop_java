package com.example.teacakeshop.controller.publicapi;

import com.example.teacakeshop.dto.request.*;
import com.example.teacakeshop.dto.response.*;
import com.example.teacakeshop.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PublicPaymentController {

    private final PaymentService paymentService;

    public PublicPaymentController(
            PaymentService paymentService
    ) {
        this.paymentService = paymentService;
    }

    /*
     * Mô phỏng chuyển khoản, MoMo hoặc VNPay.
     */
    @PostMapping("/simulate")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse simulatePayment(
            @Valid
            @RequestBody
            PaymentRequest request
    ) {
        return paymentService
                .simulateOnlinePayment(request);
    }

    /*
     * Đăng ký thanh toán khi nhận hàng.
     */
    @PostMapping("/cash-on-delivery")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse createCashOnDelivery(
            @Valid
            @RequestBody
            CashOnDeliveryRequest request
    ) {
        return paymentService
                .createCashOnDelivery(request);
    }

    /*
     * Khách xem tình trạng thanh toán.
     */
    @GetMapping("/orders/{orderCode}")
    public OrderPaymentSummaryResponse
    getPaymentSummary(
            @PathVariable String orderCode,
            @RequestParam String phone
    ) {
        return paymentService
                .getPublicPaymentSummary(
                        orderCode,
                        phone
                );
    }
}