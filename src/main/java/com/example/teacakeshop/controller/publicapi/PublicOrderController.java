package com.example.teacakeshop.controller.publicapi;

import com.example.teacakeshop.dto.request.CheckoutRequest;
import com.example.teacakeshop.dto.response.OrderResponse;
import com.example.teacakeshop.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class PublicOrderController {

    private final OrderService orderService;

    public PublicOrderController(
            OrderService orderService
    ) {
        this.orderService = orderService;
    }

    /*
     * Checkout giỏ hàng.
     *
     * Nếu có Access Token:
     * - lấy email từ Authentication
     * - gắn đơn hàng với UserAccount
     *
     * Nếu không có Access Token:
     * - tạo đơn khách vãng lai
     */
    @PostMapping("/checkout")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse checkout(
            @Valid
            @RequestBody
            CheckoutRequest request,

            Authentication authentication
    ) {
        String authenticatedEmail = null;

        if (authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(
                authentication.getName()
        )) {

            authenticatedEmail =
                    authentication.getName();
        }

        return orderService.checkout(
                request,
                authenticatedEmail
        );
    }

    /*
     * Khách xem đơn bằng mã đơn
     * và số điện thoại.
     */
    @GetMapping("/{orderCode}")
    public OrderResponse getOrder(
            @PathVariable
            String orderCode,

            @RequestParam
            String phone
    ) {
        return orderService.getPublicOrder(
                orderCode,
                phone
        );
    }
}