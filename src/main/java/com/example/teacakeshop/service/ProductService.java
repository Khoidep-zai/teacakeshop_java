package com.example.teacakeshop.service;

import com.example.teacakeshop.constant.ProductType;
import com.example.teacakeshop.dto.request.ProductRequest;
import com.example.teacakeshop.dto.response.DiscountPriceResponse;
import com.example.teacakeshop.dto.response.ProductResponse;
import com.example.teacakeshop.entity.Category;
import com.example.teacakeshop.entity.Product;
import com.example.teacakeshop.exception.ResourceNotFoundException;
import com.example.teacakeshop.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;
    private final DiscountService discountService;

    public ProductService(
            ProductRepository productRepository,
            CategoryService categoryService,
            DiscountService discountService
    ) {
        this.productRepository = productRepository;
        this.categoryService = categoryService;
        this.discountService = discountService;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> search(
            String keyword,
            ProductType productType,
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

        boolean hasKeyword =
                keyword != null
                        && !keyword.trim().isEmpty();

        Page<Product> productPage;

        if (hasKeyword && productType != null) {
            productPage =
                    productRepository
                            .findByActiveTrueAndNameContainingIgnoreCaseAndProductType(
                                    keyword.trim(),
                                    productType,
                                    pageable
                            );
        } else if (hasKeyword) {
            productPage =
                    productRepository
                            .findByActiveTrueAndNameContainingIgnoreCase(
                                    keyword.trim(),
                                    pageable
                            );
        } else if (productType != null) {
            productPage =
                    productRepository
                            .findByActiveTrueAndProductType(
                                    productType,
                                    pageable
                            );
        } else {
            productPage =
                    productRepository
                            .findByActiveTrue(pageable);
        }

        return productPage.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = findEntityById(id);

        return toResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getHotProducts() {
        return productRepository
                .findTop8ByActiveTrueAndHotTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getBestSellers() {
        return productRepository
                .findTop8ByActiveTrueOrderBySoldQuantityDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getNewestProducts() {
        return productRepository
                .findTop8ByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ProductResponse create(
            ProductRequest request
    ) {
        Category category =
                categoryService.findEntityById(
                        request.categoryId()
                );

        Product product = new Product();

        applyRequest(
                product,
                category,
                request
        );

        product.setSoldQuantity(0);

        Product savedProduct =
                productRepository.save(product);

        return toResponse(savedProduct);
    }

    @Transactional
    public ProductResponse update(
            Long id,
            ProductRequest request
    ) {
        Product product = findEntityById(id);

        Category category =
                categoryService.findEntityById(
                        request.categoryId()
                );

        applyRequest(
                product,
                category,
                request
        );

        Product savedProduct =
                productRepository.save(product);

        return toResponse(savedProduct);
    }

    @Transactional
    public void deactivate(Long id) {
        Product product = findEntityById(id);

        product.setActive(false);

        productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public Product findEntityById(Long id) {
        return productRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy sản phẩm có ID "
                                        + id
                        )
                );
    }

    private void applyRequest(
            Product product,
            Category category,
            ProductRequest request
    ) {
        product.setCategory(category);
        product.setName(request.name().trim());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setImageUrl(request.imageUrl());
        product.setProductType(request.productType());
        product.setTaste(request.taste());
        product.setTemperatureType(
                request.temperatureType()
        );
        product.setSeason(request.season());
        product.setStockQuantity(
                request.stockQuantity()
        );

        product.setHot(
                request.hot() != null
                        && request.hot()
        );

        product.setBestSeller(
                request.bestSeller() != null
                        && request.bestSeller()
        );

        product.setActive(
                request.active() == null
                        || request.active()
        );
    }

    private ProductResponse toResponse(
            Product product
    ) {
        DiscountPriceResponse discount =
                discountService
                        .calculateForProduct(product);

        return new ProductResponse(
                product.getId(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getName(),
                product.getDescription(),

                product.getPrice(),
                discount.discountAmount(),
                discount.finalPrice(),
                discount.campaignId(),
                discount.campaignName(),

                product.getImageUrl(),
                product.getProductType(),
                product.getTaste(),
                product.getTemperatureType(),
                product.getSeason(),
                product.getStockQuantity(),
                product.getSoldQuantity(),
                product.getHot(),
                product.getBestSeller(),
                product.getActive(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}