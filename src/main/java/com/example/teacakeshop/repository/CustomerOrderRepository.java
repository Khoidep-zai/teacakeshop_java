package com.example.teacakeshop.repository;

import com.example.teacakeshop.constant.OrderStatus;
import com.example.teacakeshop.entity.CustomerOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CustomerOrderRepository
        extends JpaRepository<CustomerOrder, Long>,
        JpaSpecificationExecutor<CustomerOrder> {

    /*
     * Kiểm tra mã đơn đã tồn tại hay chưa.
     */
    boolean existsByOrderCode(
            String orderCode
    );

    /*
     * Tìm đơn theo mã đơn.
     */
    Optional<CustomerOrder> findByOrderCode(
            String orderCode
    );

    /*
     * Khách vãng lai tra cứu đơn bằng
     * mã đơn và số điện thoại.
     */
    Optional<CustomerOrder>
    findByOrderCodeAndCustomerPhone(
            String orderCode,
            String customerPhone
    );

    /*
     * Admin lọc danh sách đơn theo trạng thái.
     */
    Page<CustomerOrder> findByStatus(
            OrderStatus status,
            Pageable pageable
    );

    /*
     * Tìm đơn theo trạng thái
     * và khoảng thời gian.
     */
    List<CustomerOrder>
    findByStatusAndCreatedAtBetween(
            OrderStatus status,
            LocalDateTime start,
            LocalDateTime end
    );

    /*
     * Đếm số đơn theo trạng thái.
     */
    long countByStatus(
            OrderStatus status
    );

    /*
     * Đếm tổng số đơn trong khoảng thời gian.
     *
     * start <= createdAt < end
     */
    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            LocalDateTime start,
            LocalDateTime end
    );

    /*
     * Đếm số đơn theo trạng thái
     * trong khoảng thời gian.
     */
    long countByStatusAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            OrderStatus status,
            LocalDateTime start,
            LocalDateTime end
    );

    /*
     * Tổng doanh thu theo trạng thái.
     *
     * Dashboard thường truyền COMPLETED.
     */
    @Query("""
            SELECT SUM(o.totalAmount)
            FROM CustomerOrder o
            WHERE o.status = :status
            """)
    BigDecimal sumTotalAmountByStatus(
            @Param("status")
            OrderStatus status
    );

    /*
     * Tổng doanh thu theo trạng thái
     * trong khoảng thời gian.
     */
    @Query("""
            SELECT SUM(o.totalAmount)
            FROM CustomerOrder o
            WHERE o.status = :status
              AND o.createdAt >= :start
              AND o.createdAt < :end
            """)
    BigDecimal sumTotalAmountByStatusAndCreatedAtRange(
            @Param("status")
            OrderStatus status,

            @Param("start")
            LocalDateTime start,

            @Param("end")
            LocalDateTime end
    );

    /*
     * Lấy danh sách đơn theo trạng thái
     * trong khoảng thời gian và sắp xếp tăng dần.
     */
    List<CustomerOrder>
    findByStatusAndCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtAsc(
            OrderStatus status,
            LocalDateTime start,
            LocalDateTime end
    );

    /*
     * ============================
     * PHẦN 236: ĐƠN THEO TÀI KHOẢN
     * ============================
     */

    /*
     * Lấy danh sách đơn hàng
     * thuộc một tài khoản.
     */
    Page<CustomerOrder> findByUserAccount_Id(
            Long userId,
            Pageable pageable
    );

    /*
     * Lấy một đơn theo ID
     * và kiểm tra đơn thuộc đúng tài khoản.
     */
    Optional<CustomerOrder> findByIdAndUserAccount_Id(
            Long orderId,
            Long userId
    );

    /*
     * Lấy một đơn theo mã đơn
     * và kiểm tra đơn thuộc đúng tài khoản.
     */
    Optional<CustomerOrder> findByOrderCodeAndUserAccount_Id(
            String orderCode,
            Long userId
    );

    /*
     * Đếm tổng số đơn hàng
     * thuộc một tài khoản.
     */
    long countByUserAccount_Id(
            Long userId
    );
}
