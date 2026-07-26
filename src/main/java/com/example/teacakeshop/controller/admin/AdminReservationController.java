package com.example.teacakeshop.controller.admin;

import com.example.teacakeshop.constant.ReservationStatus;
import com.example.teacakeshop.dto.request.ReservationStatusUpdateRequest;
import com.example.teacakeshop.dto.response.*;
import com.example.teacakeshop.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

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

            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
            LocalTime fromTime,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
            LocalTime toTime,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {
        LocalDateTime startAt = date == null
                ? null
                : date.atTime(
                        fromTime == null
                                ? LocalTime.MIN
                                : fromTime
                );

        LocalDateTime endAt = date == null
                ? null
                : date.atTime(
                        toTime == null
                                ? LocalTime.MAX
                                : toTime
                );

        return reservationService
                .getAllForAdmin(
                        status,
                        keyword,
                        startAt,
                        endAt,
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
