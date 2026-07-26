package com.example.teacakeshop.service;

import com.example.teacakeshop.dto.request.ProductSuggestionRequest;
import com.example.teacakeshop.dto.response.ProductSuggestionResponse;
import com.example.teacakeshop.entity.Combo;
import com.example.teacakeshop.entity.Product;
import com.example.teacakeshop.entity.ProductSuggestion;
import com.example.teacakeshop.exception.BadRequestException;
import com.example.teacakeshop.exception.ResourceNotFoundException;
import com.example.teacakeshop.repository.ProductSuggestionRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class ProductSuggestionService {

    private final ProductSuggestionRepository suggestionRepository;
    private final ProductService productService;
    private final ComboService comboService;

    public ProductSuggestionService(
            ProductSuggestionRepository suggestionRepository,
            ProductService productService,
            @Lazy ComboService comboService
    ) {
        this.suggestionRepository = suggestionRepository;
        this.productService = productService;
        this.comboService = comboService;
    }

    /*
     * API public:
     * Chỉ lấy những gợi ý đang hoạt động.
     */
    @Transactional(readOnly = true)
    public List<ProductSuggestionResponse> getPublicSuggestions(
            Long sourceProductId
    ) {
        Product sourceProduct =
                productService.findEntityById(sourceProductId);

        if (Boolean.FALSE.equals(sourceProduct.getActive())) {
            throw new ResourceNotFoundException(
                    "Không tìm thấy sản phẩm có ID "
                            + sourceProductId
            );
        }

        return suggestionRepository
                .findBySourceProduct_IdAndActiveTrueOrderByPriorityAscCreatedAtDesc(
                        sourceProductId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
     * API public:
     * Gợi ý dựa trên các sản phẩm bên trong combo.
     * Tổng hợp suggestion từ tất cả sản phẩm thành phần,
     * loại trùng và giới hạn tối đa 6 kết quả.
     */
    @Transactional(readOnly = true)
    public List<ProductSuggestionResponse> getPublicSuggestionsForCombo(
            Long comboId
    ) {
        Combo combo = comboService.findEntityById(comboId);

        if (Boolean.FALSE.equals(combo.getActive())) {
            throw new ResourceNotFoundException(
                    "Không tìm thấy combo có ID " + comboId
            );
        }

        Set<Long> seenSuggestedProductIds = new LinkedHashSet<>();
        List<ProductSuggestionResponse> results = new ArrayList<>();

        for (com.example.teacakeshop.entity.ComboItem comboItem : combo.getItems()) {
            Long productId = comboItem.getProduct().getId();

            List<ProductSuggestion> suggestions =
                    suggestionRepository
                            .findBySourceProduct_IdAndActiveTrueOrderByPriorityAscCreatedAtDesc(
                                    productId
                            );

            for (ProductSuggestion suggestion : suggestions) {
                Long suggestedId = suggestion.getSuggestedProduct().getId();

                if (seenSuggestedProductIds.add(suggestedId) && results.size() < 6) {
                    results.add(toResponse(suggestion));
                }
            }

            if (results.size() >= 6) {
                break;
            }
        }

        return results;
    }

    /*
     * Admin xem tất cả gợi ý, kể cả gợi ý đã bị ẩn.
     */
    @Transactional(readOnly = true)
    public Page<ProductSuggestionResponse> getAllForAdmin(
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

        return suggestionRepository
                .findAll(pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductSuggestionResponse getById(Long id) {
        return toResponse(findEntityById(id));
    }

    @Transactional
    public ProductSuggestionResponse create(
            ProductSuggestionRequest request
    ) {
        Product sourceProduct =
                productService.findEntityById(
                        request.sourceProductId()
                );

        Product suggestedProduct =
                productService.findEntityById(
                        request.suggestedProductId()
                );

        validateSuggestionPair(
                sourceProduct,
                suggestedProduct,
                null
        );

        ProductSuggestion suggestion =
                new ProductSuggestion();

        suggestion.setSourceProduct(sourceProduct);
        suggestion.setSuggestedProduct(suggestedProduct);
        suggestion.setReason(request.reason().trim());

        suggestion.setPriority(
                request.priority() == null
                        ? 0
                        : request.priority()
        );

        suggestion.setActive(
                request.active() == null
                        || request.active()
        );

        return toResponse(
                suggestionRepository.save(suggestion)
        );
    }

    @Transactional
    public ProductSuggestionResponse update(
            Long id,
            ProductSuggestionRequest request
    ) {
        ProductSuggestion suggestion =
                findEntityById(id);

        Product sourceProduct =
                productService.findEntityById(
                        request.sourceProductId()
                );

        Product suggestedProduct =
                productService.findEntityById(
                        request.suggestedProductId()
                );

        validateSuggestionPair(
                sourceProduct,
                suggestedProduct,
                id
        );

        suggestion.setSourceProduct(sourceProduct);
        suggestion.setSuggestedProduct(suggestedProduct);
        suggestion.setReason(request.reason().trim());

        if (request.priority() != null) {
            suggestion.setPriority(request.priority());
        }

        if (request.active() != null) {
            suggestion.setActive(request.active());
        }

        return toResponse(
                suggestionRepository.save(suggestion)
        );
    }

    /*
     * Xóa mềm:
     * Không xóa dữ liệu khỏi database.
     */
    @Transactional
    public void deactivate(Long id) {
        ProductSuggestion suggestion =
                findEntityById(id);

        suggestion.setActive(false);

        suggestionRepository.save(suggestion);
    }

    @Transactional(readOnly = true)
    public ProductSuggestion findEntityById(Long id) {
        return suggestionRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy gợi ý có ID "
                                        + id
                        )
                );
    }

    private void validateSuggestionPair(
            Product sourceProduct,
            Product suggestedProduct,
            Long currentSuggestionId
    ) {
        /*
         * Không được gợi ý một sản phẩm với chính nó.
         */
        if (sourceProduct.getId()
                .equals(suggestedProduct.getId())) {
            throw new BadRequestException(
                    "Không thể gợi ý một sản phẩm với chính nó"
            );
        }

        /*
         * Không dùng sản phẩm đã bị ẩn.
         */
        if (Boolean.FALSE.equals(sourceProduct.getActive())) {
            throw new BadRequestException(
                    "Sản phẩm nguồn đang bị ẩn"
            );
        }

        if (Boolean.FALSE.equals(suggestedProduct.getActive())) {
            throw new BadRequestException(
                    "Sản phẩm được gợi ý đang bị ẩn"
            );
        }

        /*
         * Chỉ cho phép:
         * TEA  → CAKE
         * CAKE → TEA
         */
        if (sourceProduct.getProductType()
                == suggestedProduct.getProductType()) {
            throw new BadRequestException(
                    "Gợi ý phải là giữa trà và bánh"
            );
        }

        boolean duplicateExists;

        if (currentSuggestionId == null) {
            duplicateExists =
                    suggestionRepository
                            .existsBySourceProduct_IdAndSuggestedProduct_Id(
                                    sourceProduct.getId(),
                                    suggestedProduct.getId()
                            );
        } else {
            duplicateExists =
                    suggestionRepository
                            .existsBySourceProduct_IdAndSuggestedProduct_IdAndIdNot(
                                    sourceProduct.getId(),
                                    suggestedProduct.getId(),
                                    currentSuggestionId
                            );
        }

        if (duplicateExists) {
            throw new BadRequestException(
                    "Gợi ý giữa hai sản phẩm này đã tồn tại"
            );
        }
    }

    private ProductSuggestionResponse toResponse(
            ProductSuggestion suggestion
    ) {
        Product sourceProduct =
                suggestion.getSourceProduct();

        Product suggestedProduct =
                suggestion.getSuggestedProduct();

        return new ProductSuggestionResponse(
                suggestion.getId(),

                sourceProduct.getId(),
                sourceProduct.getName(),
                sourceProduct.getProductType(),

                suggestedProduct.getId(),
                suggestedProduct.getName(),
                suggestedProduct.getProductType(),
                suggestedProduct.getImageUrl(),
                suggestedProduct.getPrice(),

                suggestion.getReason(),
                suggestion.getPriority(),
                suggestion.getActive(),

                suggestion.getCreatedAt(),
                suggestion.getUpdatedAt()
        );
    }
}