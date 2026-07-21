package com.example.teacakeshop.repository;

import com.example.teacakeshop.constant.ProductType;
import com.example.teacakeshop.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository
        extends JpaRepository<Product, Long> {

    /*
     * Lấy danh sách sản phẩm đang hoạt động.
     */
    Page<Product> findByActiveTrue(
            Pageable pageable
    );

    /*
     * Tìm sản phẩm đang hoạt động theo tên.
     */
    Page<Product> findByActiveTrueAndNameContainingIgnoreCase(
            String keyword,
            Pageable pageable
    );

    /*
     * Lọc sản phẩm đang hoạt động theo loại.
     */
    Page<Product> findByActiveTrueAndProductType(
            ProductType productType,
            Pageable pageable
    );

    /*
     * Tìm theo tên và loại sản phẩm.
     */
    Page<Product>
    findByActiveTrueAndNameContainingIgnoreCaseAndProductType(
            String keyword,
            ProductType productType,
            Pageable pageable
    );

    /*
     * Đếm tổng số sản phẩm đang hoạt động.
     */
    long countByActiveTrue();

    /*
     * Đếm số sản phẩm đang hoạt động
     * có tồn kho nhỏ hơn hoặc bằng ngưỡng.
     */
    long countByActiveTrueAndStockQuantityLessThanEqual(
            Integer threshold
    );

    /*
     * Danh sách sản phẩm tồn kho thấp,
     * sắp xếp tồn kho tăng dần rồi theo tên.
     */
    List<Product>
    findByActiveTrueAndStockQuantityLessThanEqualOrderByStockQuantityAscNameAsc(
            Integer threshold
    );

    /*
     * Sản phẩm nổi bật.
     */
    List<Product>
    findTop8ByActiveTrueAndHotTrueOrderByCreatedAtDesc();

    /*
     * Sản phẩm bán chạy.
     */
    List<Product>
    findTop8ByActiveTrueOrderBySoldQuantityDesc();

    /*
     * Sản phẩm mới nhất.
     */
    List<Product>
    findTop8ByActiveTrueOrderByCreatedAtDesc();
}