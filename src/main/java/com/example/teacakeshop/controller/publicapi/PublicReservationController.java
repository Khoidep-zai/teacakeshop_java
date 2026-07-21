package com.example.teacakeshop.controller.publicapi;

import com.example.teacakeshop.dto.request.ReservationRequest;
import com.example.teacakeshop.dto.response.ReservationAvailabilityResponse;
import com.example.teacakeshop.dto.response.ReservationResponse;
import com.example.teacakeshop.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/reservations")
public class PublicReservationController {

    private final ReservationService reservationService;

    public PublicReservationController(
            ReservationService reservationService
    ) {
        this.reservationService =
                reservationService;
    }

    /*
     * Kiểm tra khung giờ còn đủ chỗ hay không.
     */
    @GetMapping("/availability")
    public ReservationAvailabilityResponse checkAvailability(

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime reservationTime,

            @RequestParam
            Integer numberOfPeople
    ) {
        return reservationService
                .checkAvailability(
                        reservationTime,
                        numberOfPeople
                );
    }

    /*
     * Tạo yêu cầu đặt bàn.
     *
     * Có Access Token:
     * - lấy email của tài khoản đăng nhập
     * - gắn đặt bàn với UserAccount
     *
     * Không có Access Token:
     * - tạo đặt bàn khách vãng lai
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponse create(
            @Valid
            @RequestBody
            ReservationRequest request,

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

        return reservationService.create(
                request,
                authenticatedEmail
        );
    }

    /*
     * Khách tra cứu đặt bàn bằng
     * mã đặt bàn và số điện thoại.
     */
    @GetMapping("/{reservationCode}")
    public ReservationResponse getReservation(
            @PathVariable
            String reservationCode,

            @RequestParam
            String phone
    ) {
        return reservationService
                .getPublicReservation(
                        reservationCode,
                        phone
                );
    }

    /*
     * Khách tự hủy yêu cầu đặt bàn
     * khi trạng thái vẫn là PENDING.
     */
    @PatchMapping("/{reservationCode}/cancel")
    public ReservationResponse cancelReservation(
            @PathVariable
            String reservationCode,

            @RequestParam
            String phone
    ) {
        return reservationService
                .cancelByCustomer(
                        reservationCode,
                        phone
                );
    }
}