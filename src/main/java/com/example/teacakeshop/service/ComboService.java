package com.example.teacakeshop.service;

import com.example.teacakeshop.constant.WeatherType;
import com.example.teacakeshop.dto.request.ComboItemRequest;
import com.example.teacakeshop.dto.request.ComboRequest;
import com.example.teacakeshop.dto.response.ComboItemResponse;
import com.example.teacakeshop.dto.response.ComboResponse;
import com.example.teacakeshop.dto.response.DiscountPriceResponse;
import com.example.teacakeshop.entity.Combo;
import com.example.teacakeshop.entity.ComboItem;
import com.example.teacakeshop.entity.Product;
import com.example.teacakeshop.exception.BadRequestException;
import com.example.teacakeshop.exception.ResourceNotFoundException;
import com.example.teacakeshop.repository.ComboRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ComboService {

    private final ComboRepository comboRepository;
    private final ProductService productService;
    private final DiscountService discountService;

    public ComboService(
            ComboRepository comboRepository,
            ProductService productService,
            DiscountService discountService
    ) {
        this.comboRepository = comboRepository;
        this.productService = productService;
        this.discountService = discountService;
    }

    @Transactional(readOnly = true)
    public Page<ComboResponse> search(
            String keyword,
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

        LocalDate today = LocalDate.now();
        Specification<Combo> specification =
                (root, query, builder) -> builder.and(
                        builder.isTrue(root.get("active")),
                        builder.or(
                                builder.isNull(root.get("startDate")),
                                builder.lessThanOrEqualTo(
                                        root.get("startDate"),
                                        today
                                )
                        ),
                        builder.or(
                                builder.isNull(root.get("endDate")),
                                builder.greaterThanOrEqualTo(
                                        root.get("endDate"),
                                        today
                                )
                        )
                );

        if (keyword != null && !keyword.isBlank()) {
            String pattern =
                    "%" + keyword.trim().toLowerCase() + "%";
            specification = specification.and(
                    (root, query, builder) ->
                            builder.like(
                                    builder.lower(root.get("name")),
                                    pattern
                            )
            );
        }

        return comboRepository
                .findAll(specification, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ComboResponse> getAllForAdmin(
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

        return comboRepository
                .findAll(pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ComboResponse getById(Long id) {
        Combo combo = findEntityById(id);
        java.time.LocalDate today = java.time.LocalDate.now();
        if (Boolean.FALSE.equals(combo.getActive())
                || (combo.getStartDate() != null && today.isBefore(combo.getStartDate()))
                || (combo.getEndDate() != null && today.isAfter(combo.getEndDate()))) {
            throw new ResourceNotFoundException(
                    "Không tìm thấy combo đang bán có ID " + id
            );
        }
        return toResponse(combo);
    }

    @Transactional(readOnly = true)
    public List<ComboResponse> getHotCombos() {
        return comboRepository
                .findTop6ByActiveTrueAndHotTrueOrderByCreatedAtDesc()
                .stream()
                .filter(this::isCurrentlySellable)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ComboResponse> getBestSellers() {
        List<Combo> manualBestSellers =
                comboRepository
                        .findTop6ByActiveTrueAndBestSellerTrueOrderBySoldQuantityDesc();

        if (!manualBestSellers.isEmpty()) {
            return manualBestSellers
                    .stream()
                    .filter(this::isCurrentlySellable)
                    .map(this::toResponse)
                    .toList();
        }

        return comboRepository
                .findTop6ByActiveTrueOrderBySoldQuantityDesc()
                .stream()
                .filter(this::isCurrentlySellable)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ComboResponse> getNewestCombos() {
        return comboRepository
                .findTop6ByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .filter(this::isCurrentlySellable)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ComboResponse> getByWeather(
            WeatherType weatherType
    ) {
        return comboRepository
                .findByActiveTrueAndWeatherTypeOrderBySoldQuantityDesc(
                        weatherType
                )
                .stream()
                .filter(this::isCurrentlySellable)
                .map(this::toResponse)
                .toList();
    }

    private boolean isCurrentlySellable(
            Combo combo
    ) {
        LocalDate today = LocalDate.now();
        return Boolean.TRUE.equals(combo.getActive())
                && (combo.getStartDate() == null
                || !today.isBefore(combo.getStartDate()))
                && (combo.getEndDate() == null
                || !today.isAfter(combo.getEndDate()));
    }

    @Transactional
    public ComboResponse create(
            ComboRequest request
    ) {
        String normalizedName =
                request.name().trim();

        if (comboRepository
                .existsByNameIgnoreCase(normalizedName)) {
            throw new BadRequestException(
                    "Tên combo đã tồn tại"
            );
        }

        validateDates(request);

        Combo combo = new Combo();

        combo.setName(normalizedName);
        combo.setSoldQuantity(0);

        applyBasicFields(
                combo,
                request
        );

        BigDecimal originalPrice =
                rebuildComboItems(
                        combo,
                        request.items()
                );

        validateComboPrice(
                request.comboPrice(),
                originalPrice
        );

        combo.setOriginalPrice(originalPrice);

        Combo savedCombo =
                comboRepository.save(combo);

        return toResponse(savedCombo);
    }

    @Transactional
    public ComboResponse update(
            Long id,
            ComboRequest request
    ) {
        Combo combo = findEntityById(id);

        String normalizedName =
                request.name().trim();

        if (!combo.getName()
                .equalsIgnoreCase(normalizedName)
                && comboRepository
                .existsByNameIgnoreCase(normalizedName)) {

            throw new BadRequestException(
                    "Tên combo đã tồn tại"
            );
        }

        validateDates(request);

        combo.setName(normalizedName);

        applyBasicFields(
                combo,
                request
        );

        combo.clearItems();

        BigDecimal originalPrice =
                rebuildComboItems(
                        combo,
                        request.items()
                );

        validateComboPrice(
                request.comboPrice(),
                originalPrice
        );

        combo.setOriginalPrice(originalPrice);

        Combo savedCombo =
                comboRepository.save(combo);

        return toResponse(savedCombo);
    }

    @Transactional
    public void deactivate(Long id) {
        Combo combo = findEntityById(id);

        combo.setActive(false);

        comboRepository.save(combo);
    }

    @Transactional(readOnly = true)
    public Combo findEntityById(Long id) {
        return comboRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy combo có ID "
                                        + id
                        )
                );
    }

    private void applyBasicFields(
            Combo combo,
            ComboRequest request
    ) {
        combo.setDescription(
                request.description()
        );

        combo.setImageUrl(
                request.imageUrl()
        );

        combo.setComboPrice(
                request.comboPrice()
        );

        combo.setSeason(
                request.season()
        );

        combo.setWeatherType(
                request.weatherType()
        );

        combo.setStartDate(
                request.startDate()
        );

        combo.setEndDate(
                request.endDate()
        );

        combo.setHot(
                request.hot() != null
                        && request.hot()
        );

        combo.setBestSeller(
                request.bestSeller() != null
                        && request.bestSeller()
        );

        combo.setActive(
                request.active() == null
                        || request.active()
        );
    }

    private BigDecimal rebuildComboItems(
            Combo combo,
            List<ComboItemRequest> requests
    ) {
        if (requests == null
                || requests.size() < 2) {

            throw new BadRequestException(
                    "Combo phải có ít nhất 2 sản phẩm"
            );
        }

        Set<Long> productIds =
                new HashSet<>();

        BigDecimal originalPrice =
                BigDecimal.ZERO;

        for (ComboItemRequest itemRequest :
                requests) {

            if (!productIds.add(
                    itemRequest.productId()
            )) {
                throw new BadRequestException(
                        "Một sản phẩm không được xuất hiện hai lần trong combo"
                );
            }

            Product product =
                    productService.findEntityById(
                            itemRequest.productId()
                    );

            if (Boolean.FALSE.equals(
                    product.getActive()
            )) {
                throw new BadRequestException(
                        "Sản phẩm "
                                + product.getName()
                                + " đang bị ẩn"
                );
            }

            ComboItem comboItem =
                    new ComboItem();

            comboItem.setProduct(product);
            comboItem.setQuantity(
                    itemRequest.quantity()
            );

            combo.addItem(comboItem);

            BigDecimal lineTotal =
                    product.getPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            itemRequest.quantity()
                                    )
                            );

            originalPrice =
                    originalPrice.add(lineTotal);
        }

        return originalPrice;
    }

    private void validateComboPrice(
            BigDecimal comboPrice,
            BigDecimal originalPrice
    ) {
        if (comboPrice.compareTo(
                originalPrice
        ) > 0) {
            throw new BadRequestException(
                    "Giá combo không được lớn hơn tổng giá sản phẩm"
            );
        }
    }

    private void validateDates(
            ComboRequest request
    ) {
        if (request.startDate() != null
                && request.endDate() != null
                && !request.startDate()
                .isBefore(request.endDate())) {

            throw new BadRequestException(
                    "Ngày bắt đầu không được sau ngày kết thúc"
            );
        }
    }

    private ComboResponse toResponse(
            Combo combo
    ) {
        List<ComboItemResponse> itemResponses =
                combo.getItems()
                        .stream()
                        .map(item -> {
                            BigDecimal unitPrice =
                                    item.getProduct()
                                            .getPrice();

                            BigDecimal lineTotal =
                                    unitPrice.multiply(
                                            BigDecimal.valueOf(
                                                    item.getQuantity()
                                            )
                                    );

                            return new ComboItemResponse(
                                    item.getId(),
                                    item.getProduct()
                                            .getId(),
                                    item.getProduct()
                                            .getName(),
                                    item.getQuantity(),
                                    unitPrice,
                                    lineTotal
                            );
                        })
                        .toList();

        BigDecimal savingAmount =
                combo.getOriginalPrice()
                        .subtract(
                                combo.getComboPrice()
                        );

        DiscountPriceResponse discount =
                discountService
                        .calculateForCombo(combo);

        return new ComboResponse(
                combo.getId(),
                combo.getName(),
                combo.getDescription(),
                combo.getImageUrl(),
                combo.getOriginalPrice(),
                combo.getComboPrice(),
                savingAmount,

                discount.discountAmount(),
                discount.finalPrice(),
                discount.campaignId(),
                discount.campaignName(),

                combo.getSeason(),
                combo.getWeatherType(),
                combo.getSoldQuantity(),
                combo.getHot(),
                combo.getBestSeller(),
                combo.getActive(),
                combo.getStartDate(),
                combo.getEndDate(),
                combo.getCreatedAt(),
                combo.getUpdatedAt(),
                itemResponses
        );
    }
}
