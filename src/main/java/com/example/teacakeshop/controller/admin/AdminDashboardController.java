package com.example.teacakeshop.controller.admin;

import com.example.teacakeshop.dto.response.DailyRevenueResponse;
import com.example.teacakeshop.dto.response.DashboardOverviewResponse;
import com.example.teacakeshop.dto.response.LowStockProductResponse;
import com.example.teacakeshop.dto.response.TopSellingItemResponse;
import com.example.teacakeshop.service.DashboardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final DashboardService dashboardService;

    public AdminDashboardController(
            DashboardService dashboardService
    ) {
        this.dashboardService =
                dashboardService;
    }

    /*
     * Tổng quan Dashboard.
     */
    @GetMapping("/overview")
    public DashboardOverviewResponse getOverview() {
        return dashboardService.getOverview();
    }

    /*
     * Doanh thu theo ngày.
     *
     * Ví dụ:
     * /revenue/daily?days=7
     */
    @GetMapping("/revenue/daily")
    public List<DailyRevenueResponse> getDailyRevenue(
            @RequestParam(defaultValue = "7")
            int days
    ) {
        return dashboardService
                .getDailyRevenue(days);
    }

    /*
     * Sản phẩm bán chạy.
     */
    @GetMapping("/top-products")
    public List<TopSellingItemResponse> getTopProducts(
            @RequestParam(defaultValue = "5")
            int limit
    ) {
        return dashboardService
                .getTopProducts(limit);
    }

    /*
     * Combo bán chạy.
     */
    @GetMapping("/top-combos")
    public List<TopSellingItemResponse> getTopCombos(
            @RequestParam(defaultValue = "5")
            int limit
    ) {
        return dashboardService
                .getTopCombos(limit);
    }

    /*
     * Sản phẩm sắp hết hàng.
     */
    @GetMapping("/low-stock")
    public List<LowStockProductResponse> getLowStockProducts(
            @RequestParam(defaultValue = "10")
            int threshold
    ) {
        return dashboardService
                .getLowStockProducts(threshold);
    }
}