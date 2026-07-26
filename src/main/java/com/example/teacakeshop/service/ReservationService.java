package com.example.teacakeshop.service;

import com.example.teacakeshop.constant.CartItemType;
import com.example.teacakeshop.constant.OrderStatus;
import com.example.teacakeshop.constant.OrderType;
import com.example.teacakeshop.constant.PaymentPurpose;
import com.example.teacakeshop.constant.PaymentStatus;
import com.example.teacakeshop.constant.ReservationStatus;
import com.example.teacakeshop.dto.request.ReservationRequest;
import com.example.teacakeshop.dto.response.ReservationAvailabilityResponse;
import com.example.teacakeshop.dto.response.ReservationResponse;
import com.example.teacakeshop.dto.response.ReservationSummaryResponse;
import com.example.teacakeshop.entity.CustomerOrder;
import com.example.teacakeshop.entity.Reservation;
import com.example.teacakeshop.entity.UserAccount;
import com.example.teacakeshop.exception.BadRequestException;
import com.example.teacakeshop.exception.ResourceNotFoundException;
import com.example.teacakeshop.repository.PaymentRepository;
import com.example.teacakeshop.repository.ReservationRepository;
import com.example.teacakeshop.repository.UserAccountRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.ArrayList;
import java.util.Locale;
import java.util.UUID;

@Service
public class ReservationService {

    private static final int STORE_CAPACITY = 40;

    private static final int RESERVATION_DURATION_MINUTES = 90;

    private static final int MIN_ADVANCE_HOURS = 2;

    private static final int MAX_ADVANCE_DAYS = 60;

    private static final LocalTime OPENING_TIME =
            LocalTime.of(8, 0);

    /*
     * Nhận lượt đặt cuối lúc 20:30 để khách
     * sử dụng bàn tối đa 90 phút trước 22:00.
     */
    private static final LocalTime LAST_RESERVATION_TIME =
            LocalTime.of(20, 30);

    /*
     * Chỉ các trạng thái này chiếm chỗ của cửa hàng.
     */
    private static final List<ReservationStatus>
            CAPACITY_STATUSES = List.of(
            ReservationStatus.PENDING,
            ReservationStatus.CONFIRMED,
            ReservationStatus.SEATED
    );

    private final ReservationRepository reservationRepository;

    private final OrderService orderService;

    private final PaymentRepository paymentRepository;

    private final UserAccountRepository userAccountRepository;

    private final ReservationBookingControlService
            reservationBookingControlService;

    public ReservationService(
            ReservationRepository reservationRepository,
            OrderService orderService,
            PaymentRepository paymentRepository,
            UserAccountRepository userAccountRepository,
            ReservationBookingControlService
                    reservationBookingControlService
    ) {
        this.reservationRepository =
                reservationRepository;

        this.orderService =
                orderService;

        this.paymentRepository =
                paymentRepository;

        this.userAccountRepository =
                userAccountRepository;

        this.reservationBookingControlService =
                reservationBookingControlService;
    }

    /*
     * Kiểm tra khung giờ còn đủ chỗ hay không.
     */
    @Transactional(readOnly = true)
    public ReservationAvailabilityResponse checkAvailability(
            LocalDateTime reservationTime,
            Integer numberOfPeople
    ) {
        validateReservationTime(
                reservationTime
        );

        validateNumberOfPeople(
                numberOfPeople
        );

        int reservedSeats =
                calculateReservedSeats(
                        reservationTime
                );

        int remainingSeats =
                Math.max(
                        STORE_CAPACITY - reservedSeats,
                        0
                );

        boolean available =
                numberOfPeople <= remainingSeats;

        return new ReservationAvailabilityResponse(
                reservationTime,
                numberOfPeople,
                STORE_CAPACITY,
                reservedSeats,
                remainingSeats,
                available
        );
    }

    /*
     * Tạo đặt bàn.
     *
     * authenticatedEmail:
     * - Có giá trị: gắn đặt bàn với tài khoản.
     * - null hoặc rỗng: khách vãng lai.
     */
    @Transactional
    public ReservationResponse create(
            ReservationRequest request,
            String authenticatedEmail
    ) {
        /*
         * Luôn kiểm tra ở backend để khách không thể bỏ qua trạng thái
         * dừng nhận bàn bằng cách gọi API trực tiếp.
         */
        reservationBookingControlService
                .ensureReservationsAreOpen();

        validateReservationTime(
                request.reservationTime()
        );

        validateNumberOfPeople(
                request.numberOfPeople()
        );

        validateCapacity(
                request.reservationTime(),
                request.numberOfPeople()
        );

        CustomerOrder linkedOrder = null;

        if (request.orderId() != null) {
            linkedOrder =
                    validateLinkedOrder(
                            request.orderId(),
                            request.customerPhone(),
                            request.reservationTime()
                    );
        }

        Reservation reservation =
                new Reservation();

        /*
         * Phần 247:
         * Gắn lịch đặt bàn với tài khoản
         * nếu request có Access Token hợp lệ.
         */
        if (authenticatedEmail != null
                && !authenticatedEmail.isBlank()) {

            UserAccount account =
                    findUserByEmail(
                            authenticatedEmail
                    );

            reservation.setUserAccount(
                    account
            );
        }

        reservation.setReservationCode(
                generateReservationCode()
        );

        reservation.setCustomerName(
                request.customerName().trim()
        );

        reservation.setCustomerPhone(
                request.customerPhone().trim()
        );

        reservation.setCustomerEmail(
                request.customerEmail().trim()
        );

        reservation.setReservationTime(
                request.reservationTime()
        );

        reservation.setNumberOfPeople(
                request.numberOfPeople()
        );

        reservation.setNote(
                normalizeNullable(
                        request.note()
                )
        );

        reservation.setStatus(
                ReservationStatus.PENDING
        );

        reservation.setCustomerOrder(
                linkedOrder
        );

        Reservation savedReservation =
                reservationRepository.save(
                        reservation
                );

        return toResponse(
                savedReservation
        );
    }

    /*
     * Giữ method cũ để controller chưa sửa
     * vẫn có thể tạo đặt bàn khách vãng lai.
     */
    @Transactional
    public ReservationResponse create(
            ReservationRequest request
    ) {
        return create(
                request,
                null
        );
    }

    /*
     * Khách vãng lai tra cứu đặt bàn
     * bằng mã đặt bàn và số điện thoại.
     */
    @Transactional(readOnly = true)
    public ReservationResponse getPublicReservation(
            String reservationCode,
            String customerPhone
    ) {
        Reservation reservation =
                reservationRepository
                        .findByReservationCodeAndCustomerPhone(
                                reservationCode,
                                customerPhone
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Không tìm thấy thông tin đặt bàn"
                                )
                        );

        return toResponse(
                reservation
        );
    }

    /*
     * Khách tự hủy đặt bàn.
     */
    @Transactional
    public ReservationResponse cancelByCustomer(
            String reservationCode,
            String customerPhone
    ) {
        Reservation reservation =
                reservationRepository
                        .findByReservationCodeAndCustomerPhone(
                                reservationCode,
                                customerPhone
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Không tìm thấy thông tin đặt bàn"
                                )
                        );

        if (reservation.getStatus()
                != ReservationStatus.PENDING) {

            throw new BadRequestException(
                    "Khách chỉ có thể tự hủy khi yêu cầu đang chờ xác nhận"
            );
        }

        /*
         * Nếu đặt bàn đã liên kết đơn combo và đã cọc,
         * không cho tự hủy để tránh thiếu quy trình hoàn tiền.
         */
        if (reservation.getCustomerOrder() != null) {

            boolean depositPaid =
                    paymentRepository
                            .existsByCustomerOrder_IdAndPurposeAndStatus(
                                    reservation
                                            .getCustomerOrder()
                                            .getId(),
                                    PaymentPurpose.DEPOSIT,
                                    PaymentStatus.PAID
                            );

            if (depositPaid) {
                throw new BadRequestException(
                        "Đặt bàn có đơn combo đã cọc. "
                                + "Vui lòng liên hệ cửa hàng để hủy "
                                + "và xử lý hoàn tiền"
                );
            }
        }

        reservation.setStatus(
                ReservationStatus.CANCELLED
        );

        Reservation savedReservation =
                reservationRepository.save(
                        reservation
                );

        return toResponse(
                savedReservation
        );
    }

    /*
     * Admin xem danh sách đặt bàn.
     */
    @Transactional(readOnly = true)
    public Page<ReservationSummaryResponse> getAllForAdmin(
            ReservationStatus status,
            String keyword,
            LocalDateTime startAt,
            LocalDateTime endAt,
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

        Pageable pageable =
                PageRequest.of(
                        safePage,
                        safeSize,
                        Sort.by(
                                Sort.Direction.ASC,
                                "reservationTime"
                        )
                );

        Specification<Reservation> specification =
                (root, query, builder) -> {
                    List<jakarta.persistence.criteria.Predicate> predicates =
                            new ArrayList<>();

                    if (status != null) {
                        predicates.add(
                                builder.equal(
                                        root.get("status"),
                                        status
                                )
                        );
                    }

                    if (keyword != null
                            && !keyword.isBlank()) {
                        String pattern =
                                "%"
                                        + keyword.trim()
                                        .toLowerCase(Locale.ROOT)
                                        + "%";

                        predicates.add(
                                builder.or(
                                        builder.like(
                                                builder.lower(root.get("reservationCode")),
                                                pattern
                                        ),
                                        builder.like(
                                                builder.lower(root.get("customerName")),
                                                pattern
                                        ),
                                        builder.like(
                                                root.get("customerPhone"),
                                                pattern
                                        )
                                )
                        );
                    }

                    if (startAt != null) {
                        predicates.add(
                                builder.greaterThanOrEqualTo(
                                        root.get("reservationTime"),
                                        startAt
                                )
                        );
                    }

                    if (endAt != null) {
                        predicates.add(
                                builder.lessThanOrEqualTo(
                                        root.get("reservationTime"),
                                        endAt
                                )
                        );
                    }

                    return builder.and(
                            predicates.toArray(
                                    jakarta.persistence.criteria.Predicate[]::new
                            )
                    );
                };

        Page<Reservation> reservationPage =
                reservationRepository.findAll(
                        specification,
                        pageable
                );

        return reservationPage.map(
                this::toSummaryResponse
        );
    }

    /*
     * Admin xem chi tiết đặt bàn.
     */
    @Transactional(readOnly = true)
    public ReservationResponse getByIdForAdmin(
            Long id
    ) {
        return toResponse(
                findEntityById(id)
        );
    }

    /*
     * Admin cập nhật trạng thái đặt bàn.
     */
    @Transactional
    public ReservationResponse updateStatus(
            Long id,
            ReservationStatus newStatus
    ) {
        Reservation reservation =
                findEntityById(id);

        ReservationStatus currentStatus =
                reservation.getStatus();

        if (currentStatus == newStatus) {
            throw new BadRequestException(
                    "Đặt bàn đã ở trạng thái "
                            + newStatus
            );
        }

        if (!isTransitionAllowed(
                currentStatus,
                newStatus
        )) {
            throw new BadRequestException(
                    "Không thể chuyển trạng thái từ "
                            + currentStatus
                            + " sang "
                            + newStatus
            );
        }

        if (reservation.getCustomerOrder() != null) {
            Long orderId =
                    reservation.getCustomerOrder().getId();

            boolean depositPaid =
                    paymentRepository
                            .existsByCustomerOrder_IdAndPurposeAndStatus(
                                    orderId,
                                    PaymentPurpose.DEPOSIT,
                                    PaymentStatus.PAID
                            );

            if (newStatus == ReservationStatus.CONFIRMED
                    && !depositPaid) {
                throw new BadRequestException(
                        "Không thể xác nhận giữ chỗ khi tiền cọc chưa được thanh toán"
                );
            }

            if (newStatus == ReservationStatus.CANCELLED
                    && depositPaid) {
                throw new BadRequestException(
                        "Lịch đặt bàn đã thanh toán cọc. "
                                + "Cần Admin xử lý hoàn tiền trước khi hủy"
                );
            }
        }

        reservation.setStatus(
                newStatus
        );

        Reservation savedReservation =
                reservationRepository.save(
                        reservation
                );

        return toResponse(
                savedReservation
        );
    }

    @Transactional(readOnly = true)
    public Reservation findEntityById(
            Long id
    ) {
        return reservationRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy đặt bàn có ID "
                                        + id
                        )
                );
    }

    /*
     * Kiểm tra đơn hàng được liên kết
     * với lịch đặt bàn.
     */
    private CustomerOrder validateLinkedOrder(
            Long orderId,
            String customerPhone,
            LocalDateTime reservationTime
    ) {
        if (reservationRepository
                .existsByCustomerOrder_Id(orderId)) {

            throw new BadRequestException(
                    "Đơn hàng đã được liên kết "
                            + "với một đặt bàn khác"
            );
        }

        CustomerOrder order =
                orderService.findEntityById(
                        orderId
                );

        if (order.getOrderType()
                != OrderType.RESERVATION_COMBO) {

            throw new BadRequestException(
                    "Chỉ đơn RESERVATION_COMBO "
                            + "mới được liên kết với đặt bàn"
            );
        }

        if (!order.getCustomerPhone()
                .equals(customerPhone.trim())) {

            throw new BadRequestException(
                    "Số điện thoại đặt bàn "
                            + "không khớp với đơn hàng"
            );
        }

        if (order.getStatus()
                == OrderStatus.CANCELLED) {

            throw new BadRequestException(
                    "Không thể liên kết đơn hàng đã bị hủy"
            );
        }

        boolean hasCombo =
                order.getItems()
                        .stream()
                        .anyMatch(item ->
                                item.getItemType()
                                        == CartItemType.COMBO
                        );

        if (!hasCombo) {
            throw new BadRequestException(
                    "Đơn liên kết phải có "
                            + "ít nhất một combo"
            );
        }

        boolean depositPaid =
                paymentRepository
                        .existsByCustomerOrder_IdAndPurposeAndStatus(
                                orderId,
                                PaymentPurpose.DEPOSIT,
                                PaymentStatus.PAID
                        );

        if (!depositPaid) {
            throw new BadRequestException(
                    "Phải thanh toán cọc 50% "
                            + "cho đơn combo trước khi đặt bàn"
            );
        }

        if (order.getPickupTime() == null) {
            throw new BadRequestException(
                    "Đơn combo chưa có thời gian hẹn"
            );
        }

        long differenceMinutes =
                Math.abs(
                        Duration.between(
                                order.getPickupTime(),
                                reservationTime
                        ).toMinutes()
                );

        if (differenceMinutes > 15) {
            throw new BadRequestException(
                    "Thời gian đặt bàn phải khớp "
                            + "với thời gian hẹn của đơn combo, "
                            + "sai lệch tối đa 15 phút"
            );
        }

        return order;
    }

    private void validateReservationTime(
            LocalDateTime reservationTime
    ) {
        if (reservationTime == null) {
            throw new BadRequestException(
                    "Thời gian đặt bàn không được để trống"
            );
        }

        LocalDateTime minimumTime =
                LocalDateTime.now()
                        .plusHours(
                                MIN_ADVANCE_HOURS
                        );

        if (reservationTime.isBefore(
                minimumTime
        )) {
            throw new BadRequestException(
                    "Phải đặt bàn trước ít nhất 2 giờ"
            );
        }

        LocalDateTime maximumTime =
                LocalDateTime.now()
                        .plusDays(
                                MAX_ADVANCE_DAYS
                        );

        if (reservationTime.isAfter(
                maximumTime
        )) {
            throw new BadRequestException(
                    "Chỉ được đặt bàn trước tối đa 60 ngày"
            );
        }

        LocalTime reservationLocalTime =
                reservationTime.toLocalTime();

        if (reservationLocalTime.isBefore(
                OPENING_TIME
        )
                || reservationLocalTime.isAfter(
                LAST_RESERVATION_TIME
        )) {

            throw new BadRequestException(
                    "Giờ nhận đặt bàn từ 08:00 đến 20:30"
            );
        }
    }

    private void validateNumberOfPeople(
            Integer numberOfPeople
    ) {
        if (numberOfPeople == null
                || numberOfPeople < 1
                || numberOfPeople > 20) {

            throw new BadRequestException(
                    "Số người phải từ 1 đến 20"
            );
        }
    }

    private void validateCapacity(
            LocalDateTime reservationTime,
            Integer requestedPeople
    ) {
        validateNumberOfPeople(
                requestedPeople
        );

        int reservedSeats =
                calculateReservedSeats(
                        reservationTime
                );

        int remainingSeats =
                STORE_CAPACITY - reservedSeats;

        if (requestedPeople > remainingSeats) {
            throw new BadRequestException(
                    "Khung giờ này chỉ còn "
                            + Math.max(
                            remainingSeats,
                            0
                    )
                            + " chỗ"
            );
        }
    }

    /*
     * Tính tổng số ghế bị chiếm trong
     * khoảng giao nhau 90 phút.
     */
    private int calculateReservedSeats(
            LocalDateTime reservationTime
    ) {
        LocalDateTime startTime =
                reservationTime.minusMinutes(
                        RESERVATION_DURATION_MINUTES - 1
                );

        LocalDateTime endTime =
                reservationTime.plusMinutes(
                        RESERVATION_DURATION_MINUTES
                );

        Long result =
                reservationRepository
                        .sumReservedPeople(
                                CAPACITY_STATUSES,
                                startTime,
                                endTime
                        );

        return result == null
                ? 0
                : result.intValue();
    }

    private boolean isTransitionAllowed(
            ReservationStatus current,
            ReservationStatus target
    ) {
        return switch (current) {
            case PENDING ->
                    target == ReservationStatus.CONFIRMED
                            || target
                            == ReservationStatus.CANCELLED;

            case CONFIRMED ->
                    target == ReservationStatus.SEATED
                            || target
                            == ReservationStatus.CANCELLED
                            || target
                            == ReservationStatus.NO_SHOW;

            case SEATED ->
                    target == ReservationStatus.COMPLETED;

            case COMPLETED,
                 CANCELLED,
                 NO_SHOW ->
                    false;
        };
    }

    private String generateReservationCode() {
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
                            .substring(0, 6)
                            .toUpperCase();

            code =
                    "RSV-"
                            + LocalDateTime.now()
                            .format(formatter)
                            + "-"
                            + randomPart;

        } while (
                reservationRepository
                        .existsByReservationCode(code)
        );

        return code;
    }

    /*
     * Tìm tài khoản theo email
     * được lấy từ JWT subject.
     */
    private UserAccount findUserByEmail(
            String email
    ) {
        String normalizedEmail =
                email.trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        return userAccountRepository
                .findByEmailIgnoreCase(
                        normalizedEmail
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy tài khoản"
                        )
                );
    }

    private String normalizeNullable(
            String value
    ) {
        if (value == null) {
            return null;
        }

        String trimmed =
                value.trim();

        return trimmed.isEmpty()
                ? null
                : trimmed;
    }

    private ReservationSummaryResponse toSummaryResponse(
            Reservation reservation
    ) {
        String orderCode =
                reservation.getCustomerOrder() == null
                        ? null
                        : reservation
                        .getCustomerOrder()
                        .getOrderCode();

        return new ReservationSummaryResponse(
                reservation.getId(),
                reservation.getReservationCode(),
                reservation.getCustomerName(),
                reservation.getCustomerPhone(),
                reservation.getReservationTime(),
                reservation.getNumberOfPeople(),
                reservation.getStatus(),
                orderCode,
                reservation.getCreatedAt()
        );
    }

    /*
     * Public để CustomerAccountService
     * chuyển Reservation thành response.
     */
    public ReservationResponse toResponse(
            Reservation reservation
    ) {
        CustomerOrder order =
                reservation.getCustomerOrder();

        return new ReservationResponse(
                reservation.getId(),
                reservation.getReservationCode(),
                reservation.getCustomerName(),
                reservation.getCustomerPhone(),
                reservation.getCustomerEmail(),
                reservation.getReservationTime(),
                reservation.getNumberOfPeople(),
                reservation.getNote(),
                reservation.getStatus(),

                order == null
                        ? null
                        : order.getId(),

                order == null
                        ? null
                        : order.getOrderCode(),

                order == null
                        ? null
                        : order.getStatus(),

                order == null
                        ? null
                        : order.getTotalAmount(),

                reservation.getCreatedAt(),
                reservation.getUpdatedAt()
        );
    }
}
