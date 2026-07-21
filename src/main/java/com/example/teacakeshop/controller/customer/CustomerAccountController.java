package com.example.teacakeshop.controller.customer;

import com.example.teacakeshop.dto.response.CustomerProfileSummaryResponse;
import com.example.teacakeshop.dto.response.OrderResponse;
import com.example.teacakeshop.dto.response.ReservationResponse;
import com.example.teacakeshop.service.CustomerAccountService;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
public class CustomerAccountController {

    private final CustomerAccountService customerAccountService;

    public CustomerAccountController(
            CustomerAccountService customerAccountService
    ) {
        this.customerAccountService =
                customerAccountService;
    }

    @GetMapping("/summary")
    public CustomerProfileSummaryResponse getSummary(
            @AuthenticationPrincipal
            Jwt jwt
    ) {
        return customerAccountService
                .getSummary(
                        jwt.getSubject()
                );
    }

    @GetMapping("/orders")
    public Page<OrderResponse> getMyOrders(
            @AuthenticationPrincipal
            Jwt jwt,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {
        return customerAccountService
                .getMyOrders(
                        jwt.getSubject(),
                        page,
                        size
                );
    }

    @GetMapping("/orders/{id}")
    public OrderResponse getMyOrder(
            @AuthenticationPrincipal
            Jwt jwt,

            @PathVariable
            Long id
    ) {
        return customerAccountService
                .getMyOrder(
                        jwt.getSubject(),
                        id
                );
    }

    @GetMapping("/reservations")
    public Page<ReservationResponse>
    getMyReservations(
            @AuthenticationPrincipal
            Jwt jwt,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {
        return customerAccountService
                .getMyReservations(
                        jwt.getSubject(),
                        page,
                        size
                );
    }

    @GetMapping("/reservations/{id}")
    public ReservationResponse getMyReservation(
            @AuthenticationPrincipal
            Jwt jwt,

            @PathVariable
            Long id
    ) {
        return customerAccountService
                .getMyReservation(
                        jwt.getSubject(),
                        id
                );
    }
}