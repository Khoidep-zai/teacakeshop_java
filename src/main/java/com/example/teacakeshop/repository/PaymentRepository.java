package com.example.teacakeshop.repository;

import com.example.teacakeshop.constant.PaymentPurpose;
import com.example.teacakeshop.constant.PaymentStatus;
import com.example.teacakeshop.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    boolean existsByTransactionCode(
            String transactionCode
    );

    List<Payment>
    findByCustomerOrder_IdOrderByCreatedAtDesc(
            Long orderId
    );

    Page<Payment>
    findByCustomerOrder_Id(
            Long orderId,
            Pageable pageable
    );

    Optional<Payment>
    findByIdAndCustomerOrder_Id(
            Long paymentId,
            Long orderId
    );

    boolean
    existsByCustomerOrder_IdAndPurposeAndStatus(
            Long orderId,
            PaymentPurpose purpose,
            PaymentStatus status
    );

    boolean
    existsByCustomerOrder_IdAndPaymentMethodAndStatus(
            Long orderId,
            com.example.teacakeshop.constant.PaymentMethod method,
            PaymentStatus status
    );

    @Query("""
            SELECT COALESCE(SUM(p.amount), 0)
            FROM Payment p
            WHERE p.customerOrder.id = :orderId
            AND p.status = :status
            """)
    BigDecimal sumAmountByOrderIdAndStatus(
            @Param("orderId") Long orderId,
            @Param("status") PaymentStatus status
    );
}