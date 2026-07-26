package com.example.teacakeshop.repository;

import com.example.teacakeshop.constant.ReservationStatus;
import com.example.teacakeshop.entity.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository
        extends JpaRepository<Reservation, Long>,
        JpaSpecificationExecutor<Reservation> {
    Page<Reservation> findByUserAccount_Id(
            Long userId,
            Pageable pageable
    );

    Optional<Reservation> findByIdAndUserAccount_Id(
            Long reservationId,
            Long userId
    );

    Optional<Reservation> findByReservationCodeAndUserAccount_Id(
            String reservationCode,
            Long userId
    );

    long countByUserAccount_Id(
            Long userId
    );

    /*
     * Kiểm tra mã đặt bàn đã tồn tại.
     */
    boolean existsByReservationCode(
            String reservationCode
    );

    /*
     * Kiểm tra một đơn hàng đã được liên kết
     * với đặt bàn hay chưa.
     *
     * Entity Reservation phải có thuộc tính:
     * private CustomerOrder customerOrder;
     */
    boolean existsByCustomerOrder_Id(
            Long orderId
    );

    /*
     * Khách tra cứu đặt bàn bằng
     * mã đặt bàn và số điện thoại.
     */
    Optional<Reservation>
    findByReservationCodeAndCustomerPhone(
            String reservationCode,
            String customerPhone
    );

    /*
     * Admin lọc danh sách đặt bàn
     * theo trạng thái.
     */
    Page<Reservation> findByStatus(
            ReservationStatus status,
            Pageable pageable
    );

    /*
     * Đếm tổng số đặt bàn theo trạng thái.
     */
    long countByStatus(
            ReservationStatus status
    );

    /*
     * Đếm số lượt đặt bàn có thời gian đặt
     * nằm trong một khoảng thời gian.
     *
     * start <= reservationTime < end
     */
    long countByReservationTimeGreaterThanEqualAndReservationTimeLessThan(
            LocalDateTime start,
            LocalDateTime end
    );

    /*
     * Đếm đặt bàn theo trạng thái
     * trong một khoảng thời gian.
     */
    long countByStatusAndReservationTimeGreaterThanEqualAndReservationTimeLessThan(
            ReservationStatus status,
            LocalDateTime start,
            LocalDateTime end
    );

    /*
     * Tính tổng số khách đã đặt bàn
     * trong một khoảng thời gian.
     *
     * Chỉ tính các trạng thái được truyền vào,
     * ví dụ PENDING, CONFIRMED và SEATED.
     */
    @Query("""
            SELECT COALESCE(SUM(r.numberOfPeople), 0)
            FROM Reservation r
            WHERE r.status IN :statuses
              AND r.reservationTime >= :startTime
              AND r.reservationTime < :endTime
            """)
    Long sumReservedPeople(
            @Param("statuses")
            List<ReservationStatus> statuses,

            @Param("startTime")
            LocalDateTime startTime,

            @Param("endTime")
            LocalDateTime endTime
    );
}
