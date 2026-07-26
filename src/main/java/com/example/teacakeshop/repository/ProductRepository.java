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
    Page<Product> findByActiveTrueAndCategory_ActiveTrue(
            Pageable pageable
    );

    /*
     * Tìm sản phẩm đang hoạt động theo tên.
     */
    Page<Product> findByActiveTrueAndCategory_ActiveTrueAndNameContainingIgnoreCase(
            String keyword,
            Pageable pageable
    );

    /*
     * Lọc sản phẩm đang hoạt động theo loại.
     */
    Page<Product> findByActiveTrueAndCategory_ActiveTrueAndProductType(
            ProductType productType,
            Pageable pageable
    );

    /*
     * Tìm theo tên và loại sản phẩm.
     */
    Page<Product>
    findByActiveTrueAndCategory_ActiveTrueAndNameContainingIgnoreCaseAndProductType(
            String keyword,
            ProductType productType,
            Pageable pageable
    );

    /*
     * Đếm tổng số sản phẩm đang hoạt động.
     */
    long countByActiveTrue();

    long countByCategory_Id(Long categoryId);

    long countByCategory_IdAndActiveTrue(Long categoryId);

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
    findTop8ByActiveTrueAndCategory_ActiveTrueAndHotTrueOrderByCreatedAtDesc();

    /*
     * Sản phẩm bán chạy.
     */
    List<Product>
    findTop8ByActiveTrueAndCategory_ActiveTrueOrderBySoldQuantityDesc();

    /*
     * Sản phẩm mới nhất.
     */
    List<Product>
    findTop8ByActiveTrueAndCategory_ActiveTrueOrderByCreatedAtDesc();
}
