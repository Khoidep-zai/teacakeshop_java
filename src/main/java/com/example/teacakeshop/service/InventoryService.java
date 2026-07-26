package com.example.teacakeshop.service;

import com.example.teacakeshop.dto.request.InventoryAdjustmentRequest;
import com.example.teacakeshop.dto.response.InventoryAdjustmentResponse;
import com.example.teacakeshop.entity.InventoryAdjustment;
import com.example.teacakeshop.entity.Product;
import com.example.teacakeshop.exception.BadRequestException;
import com.example.teacakeshop.repository.InventoryAdjustmentRepository;
import com.example.teacakeshop.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {

    private final ProductService productService;
    private final ProductRepository productRepository;
    private final InventoryAdjustmentRepository adjustmentRepository;

    public InventoryService(
            ProductService productService,
            ProductRepository productRepository,
            InventoryAdjustmentRepository adjustmentRepository
    ) {
        this.productService = productService;
        this.productRepository = productRepository;
        this.adjustmentRepository = adjustmentRepository;
    }

    @Transactional
    public InventoryAdjustmentResponse adjust(
            Long productId,
            InventoryAdjustmentRequest request,
            String adjustedBy
    ) {
        Product product = productService.findEntityById(productId);
        int previous = product.getStockQuantity() == null
                ? 0
                : product.getStockQuantity();
        int next = request.stockQuantity();

        if (previous == next) {
            throw new BadRequestException(
                    "Số lượng tồn mới không thay đổi"
            );
        }

        product.setStockQuantity(next);
        productRepository.save(product);

        InventoryAdjustment adjustment =
                new InventoryAdjustment();
        adjustment.setProduct(product);
        adjustment.setPreviousQuantity(previous);
        adjustment.setNewQuantity(next);
        adjustment.setQuantityChange(next - previous);
        adjustment.setNote(request.note().trim());
        adjustment.setAdjustedBy(adjustedBy);

        return toResponse(
                adjustmentRepository.save(adjustment)
        );
    }

    @Transactional(readOnly = true)
    public Page<InventoryAdjustmentResponse> getHistory(
            int page,
            int size
    ) {
        return adjustmentRepository.findAll(
                PageRequest.of(
                        Math.max(page, 0),
                        Math.min(Math.max(size, 1), 100),
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                )
        ).map(this::toResponse);
    }

    private InventoryAdjustmentResponse toResponse(
            InventoryAdjustment adjustment
    ) {
        return new InventoryAdjustmentResponse(
                adjustment.getId(),
                adjustment.getProduct().getId(),
                adjustment.getProduct().getName(),
                adjustment.getPreviousQuantity(),
                adjustment.getNewQuantity(),
                adjustment.getQuantityChange(),
                adjustment.getNote(),
                adjustment.getAdjustedBy(),
                adjustment.getCreatedAt()
        );
    }
}
