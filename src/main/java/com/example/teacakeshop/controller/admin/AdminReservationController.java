package com.example.teacakeshop.controller.admin;

import com.example.teacakeshop.constant.ReservationStatus;
import com.example.teacakeshop.dto.request.ReservationStatusUpdateRequest;
import com.example.teacakeshop.dto.response.*;
import com.example.teacakeshop.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reservations")
public class AdminReservationController {

    private final ReservationService reservationService;

    public AdminReservationController(
            ReservationService reservationService
    ) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public Page<ReservationSummaryResponse> getAll(

            @RequestParam(required = false)
            ReservationStatus status,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {
        return reservationService
                .getAllForAdmin(
                        status,
                        page,
                        size
                );
    }

    @GetMapping("/{id}")
    public ReservationResponse getById(
            @PathVariable Long id
    ) {
        return reservationService
                .getByIdForAdmin(id);
    }

    @PatchMapping("/{id}/status")
    public ReservationResponse updateStatus(

            @PathVariable Long id,

            @Valid
            @RequestBody
            ReservationStatusUpdateRequest request
    ) {
        return reservationService
                .updateStatus(
                        id,
                        request.status()
                );
    }
}