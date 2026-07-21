package com.example.teacakeshop.service;

import com.example.teacakeshop.dto.response.CustomerProfileSummaryResponse;
import com.example.teacakeshop.dto.response.OrderResponse;
import com.example.teacakeshop.dto.response.ReservationResponse;
import com.example.teacakeshop.entity.CustomerOrder;
import com.example.teacakeshop.entity.Reservation;
import com.example.teacakeshop.entity.UserAccount;
import com.example.teacakeshop.exception.ResourceNotFoundException;
import com.example.teacakeshop.repository.CustomerOrderRepository;
import com.example.teacakeshop.repository.ReservationRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerAccountService {

    private final CustomerOrderRepository customerOrderRepository;
    private final ReservationRepository reservationRepository;
    private final AuthService authService;
    private final OrderService orderService;
    private final ReservationService reservationService;

    public CustomerAccountService(
            CustomerOrderRepository customerOrderRepository,
            ReservationRepository reservationRepository,
            AuthService authService,
            OrderService orderService,
            ReservationService reservationService
    ) {
        this.customerOrderRepository =
                customerOrderRepository;

        this.reservationRepository =
                reservationRepository;

        this.authService = authService;
        this.orderService = orderService;
        this.reservationService =
                reservationService;
    }

    @Transactional(readOnly = true)
    public CustomerProfileSummaryResponse getSummary(
            String email
    ) {
        UserAccount account =
                authService.findByEmail(email);

        return new CustomerProfileSummaryResponse(
                authService.toResponse(account),

                customerOrderRepository
                        .countByUserAccount_Id(
                                account.getId()
                        ),

                reservationRepository
                        .countByUserAccount_Id(
                                account.getId()
                        )
        );
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(
            String email,
            int page,
            int size
    ) {
        UserAccount account =
                authService.findByEmail(email);

        return customerOrderRepository
                .findByUserAccount_Id(
                        account.getId(),
                        createPageable(page, size)
                )
                .map(orderService::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getMyOrder(
            String email,
            Long orderId
    ) {
        UserAccount account =
                authService.findByEmail(email);

        CustomerOrder order =
                customerOrderRepository
                        .findByIdAndUserAccount_Id(
                                orderId,
                                account.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Không tìm thấy đơn hàng"
                                )
                        );

        return orderService.toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<ReservationResponse> getMyReservations(
            String email,
            int page,
            int size
    ) {
        UserAccount account =
                authService.findByEmail(email);

        return reservationRepository
                .findByUserAccount_Id(
                        account.getId(),
                        createPageable(page, size)
                )
                .map(reservationService::toResponse);
    }

    @Transactional(readOnly = true)
    public ReservationResponse getMyReservation(
            String email,
            Long reservationId
    ) {
        UserAccount account =
                authService.findByEmail(email);

        Reservation reservation =
                reservationRepository
                        .findByIdAndUserAccount_Id(
                                reservationId,
                                account.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Không tìm thấy đặt bàn"
                                )
                        );

        return reservationService.toResponse(
                reservation
        );
    }

    private Pageable createPageable(
            int page,
            int size
    ) {
        int safePage =
                Math.max(page, 0);

        int safeSize =
                Math.min(
                        Math.max(size, 1),
                        100
                );

        return PageRequest.of(
                safePage,
                safeSize,
                Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"
                )
        );
    }
}