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
     * Khách xem đơn bằng mã đơn.
     * - Có phone: khách vãng lai xem qua phone + orderCode
     * - Không có phone nhưng có auth: user đăng nhập xem đơn của mình
     * - Không có cả hai: trả 400
     */
    @GetMapping("/{orderCode}")
    public OrderResponse getOrder(
            @PathVariable
            String orderCode,

            @RequestParam(required = false)
            String phone,

            Authentication authentication
    ) {
        // Nếu có phone, dùng public lookup (cả guest và logged-in)
        if (phone != null && !phone.isBlank()) {
            return orderService.getPublicOrder(orderCode, phone);
        }

        // Nếu user đã đăng nhập, cho phép xem đơn của mình không cần phone
        if (authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getName())) {
            return orderService.getOrderByCodeForUser(orderCode, authentication.getName());
        }

        throw new com.example.teacakeshop.exception.BadRequestException(
                "Vui lòng cung cấp số điện thoại để tra cứu đơn hàng"
        );
    }
}