package com.example.teacakeshop.service;

import com.example.teacakeshop.constant.CartItemType;
import com.example.teacakeshop.constant.OrderStatus;
import com.example.teacakeshop.constant.ReservationStatus;
import com.example.teacakeshop.dto.response.DailyRevenueResponse;
import com.example.teacakeshop.dto.response.DashboardOverviewResponse;
import com.example.teacakeshop.dto.response.LowStockProductResponse;
import com.example.teacakeshop.dto.response.TopSellingItemResponse;
import com.example.teacakeshop.entity.CustomerOrder;
import com.example.teacakeshop.entity.Product;
import com.example.teacakeshop.exception.BadRequestException;
import com.example.teacakeshop.repository.CustomerOrderRepository;
import com.example.teacakeshop.repository.OrderItemRepository;
import com.example.teacakeshop.repository.ProductRepository;
import com.example.teacakeshop.repository.ReservationRepository;
import com.example.teacakeshop.repository.projection.TopSellingItemProjection;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private static final int DEFAULT_LOW_STOCK_THRESHOLD = 10;

    private final CustomerOrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReservationRepository reservationRepository;
    private final ProductRepository productRepository;

    public DashboardService(
            CustomerOrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ReservationRepository reservationRepository,
            ProductRepository productRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.reservationRepository = reservationRepository;
        this.productRepository = productRepository;
    }

    /*
     * Tổng quan Dashboard.
     */
    @Transactional(readOnly = true)
    public DashboardOverviewResponse getOverview() {
        LocalDate today = LocalDate.now();

        LocalDateTime todayStart =
                today.atStartOfDay();

        LocalDateTime tomorrowStart =
                today.plusDays(1).atStartOfDay();

        YearMonth currentMonth =
                YearMonth.from(today);

        LocalDateTime monthStart =
                currentMonth
                        .atDay(1)
                        .atStartOfDay();

        LocalDateTime nextMonthStart =
                currentMonth
                        .plusMonths(1)
                        .atDay(1)
                        .atStartOfDay();

        BigDecimal totalRevenue =
                zeroIfNull(
                        orderRepository
                                .sumTotalAmountByStatus(
                                        OrderStatus.COMPLETED
                                )
                );

        BigDecimal todayRevenue =
                zeroIfNull(
                        orderRepository
                                .sumTotalAmountByStatusAndCreatedAtRange(
                                        OrderStatus.COMPLETED,
                                        todayStart,
                                        tomorrowStart
                                )
                );

        BigDecimal monthRevenue =
                zeroIfNull(
                        orderRepository
                                .sumTotalAmountByStatusAndCreatedAtRange(
                                        OrderStatus.COMPLETED,
                                        monthStart,
                                        nextMonthStart
                                )
                );

        long totalOrders =
                orderRepository.count();

        long todayOrders =
                orderRepository
                        .countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                                todayStart,
                                tomorrowStart
                        );

        long pendingOrders =
                orderRepository.countByStatus(
                        OrderStatus.PENDING
                );

        long confirmedOrders =
                orderRepository.countByStatus(
                        OrderStatus.CONFIRMED
                );

        long preparingOrders =
                orderRepository.countByStatus(
                        OrderStatus.PREPARING
                );

        long completedOrders =
                orderRepository.countByStatus(
                        OrderStatus.COMPLETED
                );

        long cancelledOrders =
                orderRepository.countByStatus(
                        OrderStatus.CANCELLED
                );

        long totalReservations =
                reservationRepository.count();

        long todayReservations =
                reservationRepository
                        .countByReservationTimeGreaterThanEqualAndReservationTimeLessThan(
                                todayStart,
                                tomorrowStart
                        );

        long pendingReservations =
                reservationRepository.countByStatus(
                        ReservationStatus.PENDING
                );

        long confirmedReservations =
                reservationRepository.countByStatus(
                        ReservationStatus.CONFIRMED
                );

        long seatedReservations =
                reservationRepository.countByStatus(
                        ReservationStatus.SEATED
                );

        long completedReservations =
                reservationRepository.countByStatus(
                        ReservationStatus.COMPLETED
                );

        long cancelledReservations =
                reservationRepository.countByStatus(
                        ReservationStatus.CANCELLED
                );

        long noShowReservations =
                reservationRepository.countByStatus(
                        ReservationStatus.NO_SHOW
                );

        long activeProducts =
                productRepository.countByActiveTrue();

        long lowStockProducts =
                productRepository
                        .countByActiveTrueAndStockQuantityLessThanEqual(
                                DEFAULT_LOW_STOCK_THRESHOLD
                        );

        return new DashboardOverviewResponse(
                totalRevenue,
                todayRevenue,
                monthRevenue,
                totalOrders,
                todayOrders,
                pendingOrders,
                confirmedOrders,
                preparingOrders,
                completedOrders,
                cancelledOrders,
                totalReservations,
                todayReservations,
                pendingReservations,
                confirmedReservations,
                seatedReservations,
                completedReservations,
                cancelledReservations,
                noShowReservations,
                activeProducts,
                lowStockProducts,
                LocalDateTime.now()
        );
    }

    /*
     * Doanh thu từng ngày.
     */
    @Transactional(readOnly = true)
    public List<DailyRevenueResponse> getDailyRevenue(
            int days
    ) {
        int safeDays =
                Math.min(
                        Math.max(days, 1),
                        365
                );

        LocalDate endDate =
                LocalDate.now();

        LocalDate startDate =
                endDate.minusDays(
                        safeDays - 1L
                );

        return buildDailyRevenue(startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<DailyRevenueResponse> getDailyRevenue(
            LocalDate startDate,
            LocalDate endDate
    ) {
        LocalDate safeEnd = endDate == null ? LocalDate.now() : endDate;
        LocalDate safeStart = startDate == null ? safeEnd.minusDays(6) : startDate;

        if (safeStart.isAfter(safeEnd)) {
            throw new BadRequestException("Ngày bắt đầu không được sau ngày kết thúc");
        }
        if (safeStart.plusDays(364).isBefore(safeEnd)) {
            throw new BadRequestException("Khoảng thống kê tối đa là 365 ngày");
        }

        return buildDailyRevenue(safeStart, safeEnd);
    }

    private List<DailyRevenueResponse> buildDailyRevenue(
            LocalDate startDate,
            LocalDate endDate
    ) {
        int safeDays = (int) java.time.temporal.ChronoUnit.DAYS
                .between(startDate, endDate) + 1;

        LocalDateTime start =
                startDate.atStartOfDay();

        LocalDateTime end =
                endDate
                        .plusDays(1)
                        .atStartOfDay();

        List<CustomerOrder> completedOrders =
                orderRepository
                        .findByStatusAndCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtAsc(
                                OrderStatus.COMPLETED,
                                start,
                                end
                        );

        Map<LocalDate, BigDecimal> revenueByDate =
                new LinkedHashMap<>();

        Map<LocalDate, Long> orderCountByDate =
                new LinkedHashMap<>();

        for (int index = 0;
             index < safeDays;
             index++) {

            LocalDate date =
                    startDate.plusDays(index);

            revenueByDate.put(
                    date,
                    BigDecimal.ZERO
            );

            orderCountByDate.put(
                    date,
                    0L
            );
        }

        for (CustomerOrder order :
                completedOrders) {

            LocalDate orderDate =
                    order.getCreatedAt()
                            .toLocalDate();

            revenueByDate.computeIfPresent(
                    orderDate,
                    (date, revenue) ->
                            revenue.add(
                                    order.getTotalAmount()
                            )
            );

            orderCountByDate.computeIfPresent(
                    orderDate,
                    (date, count) ->
                            count + 1
            );
        }

        List<DailyRevenueResponse> responses =
                new ArrayList<>();

        for (LocalDate date :
                revenueByDate.keySet()) {

            responses.add(
                    new DailyRevenueResponse(
                            date,
                            revenueByDate.get(date),
                            orderCountByDate.get(date)
                    )
            );
        }

        return responses;
    }

    /*
     * Sản phẩm bán chạy.
     */
    @Transactional(readOnly = true)
    public List<TopSellingItemResponse> getTopProducts(
            int limit
    ) {
        int safeLimit =
                Math.min(
                        Math.max(limit, 1),
                        50
                );

        List<TopSellingItemProjection> results =
                orderItemRepository
                        .findTopSellingProducts(
                                CartItemType.PRODUCT,
                                OrderStatus.COMPLETED,
                                PageRequest.of(
                                        0,
                                        safeLimit
                                )
                        );

        return results
                .stream()
                .map(result ->
                        new TopSellingItemResponse(
                                result.getItemId(),
                                result.getItemName(),
                                CartItemType.PRODUCT,
                                result.getSoldQuantity(),
                                zeroIfNull(
                                        result.getRevenue()
                                )
                        )
                )
                .toList();
    }

    /*
     * Combo bán chạy.
     */
    @Transactional(readOnly = true)
    public List<TopSellingItemResponse> getTopCombos(
            int limit
    ) {
        int safeLimit =
                Math.min(
                        Math.max(limit, 1),
                        50
                );

        List<TopSellingItemProjection> results =
                orderItemRepository
                        .findTopSellingCombos(
                                CartItemType.COMBO,
                                OrderStatus.COMPLETED,
                                PageRequest.of(
                                        0,
                                        safeLimit
                                )
                        );

        return results
                .stream()
                .map(result ->
                        new TopSellingItemResponse(
                                result.getItemId(),
                                result.getItemName(),
                                CartItemType.COMBO,
                                result.getSoldQuantity(),
                                zeroIfNull(
                                        result.getRevenue()
                                )
                        )
                )
                .toList();
    }

    /*
     * Sản phẩm còn ít hàng.
     */
    @Transactional(readOnly = true)
    public List<LowStockProductResponse> getLowStockProducts(
            int threshold
    ) {
        int safeThreshold =
                Math.min(
                        Math.max(threshold, 0),
                        100000
                );

        List<Product> products =
                productRepository
                        .findByActiveTrueAndStockQuantityLessThanEqualOrderByStockQuantityAscNameAsc(
                                safeThreshold
                        );

        return products
                .stream()
                .map(product ->
                        new LowStockProductResponse(
                                product.getId(),
                                product.getName(),

                                product.getCategory() == null
                                        ? null
                                        : product.getCategory().getId(),

                                product.getCategory() == null
                                        ? null
                                        : product.getCategory().getName(),

                                product.getStockQuantity(),
                                product.getActive()
                        )
                )
                .toList();
    }

    private BigDecimal zeroIfNull(
            BigDecimal value
    ) {
        return value == null
                ? BigDecimal.ZERO
                : value;
    }
}
