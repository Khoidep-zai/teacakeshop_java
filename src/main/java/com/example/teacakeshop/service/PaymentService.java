package com.example.teacakeshop.service;

import com.example.teacakeshop.constant.*;
import com.example.teacakeshop.dto.request.*;
import com.example.teacakeshop.dto.response.*;
import com.example.teacakeshop.entity.CustomerOrder;
import com.example.teacakeshop.entity.Payment;
import com.example.teacakeshop.exception.BadRequestException;
import com.example.teacakeshop.exception.ResourceNotFoundException;
import com.example.teacakeshop.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CustomerOrderRepository orderRepository;
    private final OrderService orderService;

    public PaymentService(
            PaymentRepository paymentRepository,
            CustomerOrderRepository orderRepository,
            OrderService orderService
    ) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.orderService = orderService;
    }

    /*
     * Mô phỏng thanh toán online thành công ngay.
     */
    @Transactional
    public PaymentResponse simulateOnlinePayment(
            PaymentRequest request
    ) {
        validateOnlineMethod(
                request.paymentMethod()
        );

        CustomerOrder order =
                orderService.findEntityById(
                        request.orderId()
                );

        validateOrderCanBePaid(order);

        BigDecimal paidBefore =
                getPaidAmount(order.getId());

        BigDecimal outstandingBefore =
                calculateOutstanding(
                        order,
                        paidBefore
                );

        if (outstandingBefore.compareTo(
                BigDecimal.ZERO
        ) <= 0) {
            throw new BadRequestException(
                    "Đơn hàng đã được thanh toán đầy đủ"
            );
        }

        BigDecimal paymentAmount =
                determinePaymentAmount(
                        order,
                        request.purpose(),
                        paidBefore,
                        outstandingBefore
                );

        Payment payment = new Payment();

        payment.setCustomerOrder(order);
        payment.setTransactionCode(
                generateTransactionCode()
        );
        payment.setPaymentMethod(
                request.paymentMethod()
        );
        payment.setPurpose(request.purpose());
        payment.setStatus(PaymentStatus.PAID);
        payment.setAmount(paymentAmount);
        payment.setPaidAt(LocalDateTime.now());
        payment.setNote(
                normalizeNullable(request.note())
        );

        Payment savedPayment =
                paymentRepository.save(payment);

        /*
         * Khi cọc hoặc thanh toán thành công,
         * đơn chờ được chuyển sang đã xác nhận.
         */
        autoConfirmOrder(order);

        return toResponse(savedPayment);
    }

    /*
     * Tạo yêu cầu thanh toán khi nhận hàng.
     * Giao dịch ở trạng thái PENDING.
     */
    @Transactional
    public PaymentResponse createCashOnDelivery(
            CashOnDeliveryRequest request
    ) {
        CustomerOrder order =
                orderService.findEntityById(
                        request.orderId()
                );

        validateOrderCanBePaid(order);

        if (order.getOrderType()
                != OrderType.NORMAL) {
            throw new BadRequestException(
                    "Thanh toán khi nhận hàng chỉ áp dụng cho đơn NORMAL"
            );
        }

        BigDecimal paidAmount =
                getPaidAmount(order.getId());

        BigDecimal outstandingAmount =
                calculateOutstanding(
                        order,
                        paidAmount
                );

        if (outstandingAmount.compareTo(
                BigDecimal.ZERO
        ) <= 0) {
            throw new BadRequestException(
                    "Đơn hàng đã được thanh toán đầy đủ"
            );
        }

        boolean pendingCodExists =
                paymentRepository
                        .existsByCustomerOrder_IdAndPaymentMethodAndStatus(
                                order.getId(),
                                PaymentMethod.CASH_ON_DELIVERY,
                                PaymentStatus.PENDING
                        );

        if (pendingCodExists) {
            throw new BadRequestException(
                    "Đơn hàng đã có giao dịch thanh toán khi nhận hàng đang chờ"
            );
        }

        Payment payment = new Payment();

        payment.setCustomerOrder(order);
        payment.setTransactionCode(
                generateTransactionCode()
        );
        payment.setPaymentMethod(
                PaymentMethod.CASH_ON_DELIVERY
        );
        payment.setPurpose(PaymentPurpose.FULL);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setAmount(outstandingAmount);
        payment.setPaidAt(null);
        payment.setNote(
                normalizeNullable(request.note())
        );

        return toResponse(
                paymentRepository.save(payment)
        );
    }

    /*
     * Admin xác nhận giao dịch tiền mặt đã được trả.
     */
    @Transactional
    public PaymentResponse markCashPaymentAsPaid(
            Long paymentId
    ) {
        Payment payment =
                findEntityById(paymentId);

        if (payment.getPaymentMethod()
                != PaymentMethod.CASH_ON_DELIVERY) {
            throw new BadRequestException(
                    "Chỉ có thể xác nhận giao dịch CASH_ON_DELIVERY"
            );
        }

        if (payment.getStatus()
                != PaymentStatus.PENDING) {
            throw new BadRequestException(
                    "Giao dịch không ở trạng thái PENDING"
            );
        }

        CustomerOrder order =
                payment.getCustomerOrder();

        validateOrderCanBePaid(order);

        BigDecimal paidBefore =
                getPaidAmount(order.getId());

        BigDecimal outstandingBefore =
                calculateOutstanding(
                        order,
                        paidBefore
                );

        if (outstandingBefore.compareTo(
                BigDecimal.ZERO
        ) <= 0) {
            throw new BadRequestException(
                    "Đơn hàng đã được thanh toán đầy đủ"
            );
        }

        /*
         * Phòng trường hợp tổng đơn thay đổi
         * hoặc có giao dịch khác đã thanh toán trước.
         */
        if (payment.getAmount()
                .compareTo(outstandingBefore) > 0) {
            payment.setAmount(outstandingBefore);
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());

        Payment savedPayment =
                paymentRepository.save(payment);

        autoConfirmOrder(order);

        return toResponse(savedPayment);
    }

    /*
     * Khách xem lịch sử thanh toán bằng mã đơn
     * và số điện thoại.
     */
    @Transactional(readOnly = true)
    public OrderPaymentSummaryResponse
    getPublicPaymentSummary(
            String orderCode,
            String customerPhone
    ) {
        CustomerOrder order =
                orderRepository
                        .findByOrderCodeAndCustomerPhone(
                                orderCode,
                                customerPhone
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Không tìm thấy đơn hàng"
                                )
                        );

        return buildSummary(order);
    }

    /*
     * Admin xem tổng quan thanh toán của một đơn.
     */
    @Transactional(readOnly = true)
    public OrderPaymentSummaryResponse
    getAdminPaymentSummary(Long orderId) {
        CustomerOrder order =
                orderService.findEntityById(orderId);

        return buildSummary(order);
    }

    /*
     * Admin xem danh sách giao dịch.
     */
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getAllForAdmin(
            Long orderId,
            int page,
            int size
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(
                Math.max(size, 1),
                100
        );

        Pageable pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"
                )
        );

        Page<Payment> paymentPage;

        if (orderId == null) {
            paymentPage =
                    paymentRepository.findAll(pageable);
        } else {
            orderService.findEntityById(orderId);

            paymentPage =
                    paymentRepository
                            .findByCustomerOrder_Id(
                                    orderId,
                                    pageable
                            );
        }

        return paymentPage.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Payment findEntityById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy giao dịch thanh toán có ID "
                                        + id
                        )
                );
    }

    private BigDecimal determinePaymentAmount(
            CustomerOrder order,
            PaymentPurpose purpose,
            BigDecimal paidBefore,
            BigDecimal outstandingBefore
    ) {
        if (purpose == PaymentPurpose.DEPOSIT) {
            if (Boolean.FALSE.equals(
                    order.getDepositRequired()
            )) {
                throw new BadRequestException(
                        "Đơn hàng này không yêu cầu tiền cọc"
                );
            }

            boolean depositPaid =
                    paymentRepository
                            .existsByCustomerOrder_IdAndPurposeAndStatus(
                                    order.getId(),
                                    PaymentPurpose.DEPOSIT,
                                    PaymentStatus.PAID
                            );

            if (depositPaid) {
                throw new BadRequestException(
                        "Tiền cọc của đơn hàng đã được thanh toán"
                );
            }

            BigDecimal requiredDeposit =
                    order.getDepositAmount();

            if (requiredDeposit.compareTo(
                    outstandingBefore
            ) > 0) {
                return outstandingBefore;
            }

            return requiredDeposit;
        }

        if (purpose == PaymentPurpose.REMAINING) {
            if (Boolean.FALSE.equals(
                    order.getDepositRequired()
            )) {
                throw new BadRequestException(
                        "Đơn hàng này không có khoản tiền cọc"
                );
            }

            boolean depositPaid =
                    paymentRepository
                            .existsByCustomerOrder_IdAndPurposeAndStatus(
                                    order.getId(),
                                    PaymentPurpose.DEPOSIT,
                                    PaymentStatus.PAID
                            );

            if (!depositPaid) {
                throw new BadRequestException(
                        "Phải thanh toán tiền cọc trước khi thanh toán phần còn lại"
                );
            }

            return outstandingBefore;
        }

        /*
         * FULL nghĩa là thanh toán toàn bộ
         * số tiền hiện còn thiếu.
         */
        if (purpose == PaymentPurpose.FULL) {
            return outstandingBefore;
        }

        throw new BadRequestException(
                "Mục đích thanh toán không hợp lệ"
        );
    }

    private void validateOnlineMethod(
            PaymentMethod method
    ) {
        if (method == PaymentMethod.CASH_ON_DELIVERY) {
            throw new BadRequestException(
                    "CASH_ON_DELIVERY không dùng API thanh toán mô phỏng online"
            );
        }
    }

    private void validateOrderCanBePaid(
            CustomerOrder order
    ) {
        if (order.getStatus()
                == OrderStatus.CANCELLED) {
            throw new BadRequestException(
                    "Không thể thanh toán đơn hàng đã bị hủy"
            );
        }
    }

    private void autoConfirmOrder(
            CustomerOrder order
    ) {
        if (order.getStatus()
                == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
        }
    }

    private BigDecimal getPaidAmount(
            Long orderId
    ) {
        BigDecimal paidAmount =
                paymentRepository
                        .sumAmountByOrderIdAndStatus(
                                orderId,
                                PaymentStatus.PAID
                        );

        return paidAmount == null
                ? BigDecimal.ZERO
                : paidAmount;
    }

    private BigDecimal calculateOutstanding(
            CustomerOrder order,
            BigDecimal paidAmount
    ) {
        BigDecimal outstanding =
                order.getTotalAmount()
                        .subtract(paidAmount);

        if (outstanding.compareTo(
                BigDecimal.ZERO
        ) < 0) {
            return BigDecimal.ZERO;
        }

        return outstanding;
    }

    private OrderPaymentSummaryResponse buildSummary(
            CustomerOrder order
    ) {
        BigDecimal paidAmount =
                getPaidAmount(order.getId());

        BigDecimal outstandingAmount =
                calculateOutstanding(
                        order,
                        paidAmount
                );

        List<PaymentResponse> payments =
                paymentRepository
                        .findByCustomerOrder_IdOrderByCreatedAtDesc(
                                order.getId()
                        )
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return new OrderPaymentSummaryResponse(
                order.getId(),
                order.getOrderCode(),
                order.getOrderType(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getDepositRequired(),
                order.getDepositAmount(),
                paidAmount,
                outstandingAmount,
                outstandingAmount.compareTo(
                        BigDecimal.ZERO
                ) == 0,
                payments
        );
    }

    private PaymentResponse toResponse(
            Payment payment
    ) {
        CustomerOrder order =
                payment.getCustomerOrder();

        BigDecimal paidAmount =
                getPaidAmount(order.getId());

        BigDecimal outstandingAmount =
                calculateOutstanding(
                        order,
                        paidAmount
                );

        return new PaymentResponse(
                payment.getId(),
                order.getId(),
                order.getOrderCode(),
                payment.getTransactionCode(),
                payment.getPaymentMethod(),
                payment.getPurpose(),
                payment.getStatus(),
                payment.getAmount(),
                order.getTotalAmount(),
                paidAmount,
                outstandingAmount,
                payment.getPaidAt(),
                payment.getNote(),
                payment.getCreatedAt()
        );
    }

    private String generateTransactionCode() {
        String code;

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern(
                        "yyyyMMddHHmmss"
                );

        do {
            String randomPart =
                    UUID.randomUUID()
                            .toString()
                            .replace("-", "")
                            .substring(0, 8)
                            .toUpperCase();

            code = "PAY-"
                    + LocalDateTime.now()
                    .format(formatter)
                    + "-"
                    + randomPart;

        } while (
                paymentRepository
                        .existsByTransactionCode(code)
        );

        return code;
    }

    private String normalizeNullable(
            String value
    ) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();

        return trimmed.isEmpty()
                ? null
                : trimmed;
    }
}