package com.example.teacakeshop.service;

import com.example.teacakeshop.constant.*;
import com.example.teacakeshop.dto.request.DiscountCampaignRequest;
import com.example.teacakeshop.dto.response.*;
import com.example.teacakeshop.entity.*;
import com.example.teacakeshop.exception.*;
import com.example.teacakeshop.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DiscountService {

    private static final BigDecimal ONE_HUNDRED =
            new BigDecimal("100");

    private final DiscountCampaignRepository campaignRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ComboRepository comboRepository;

    public DiscountService(
            DiscountCampaignRepository campaignRepository,
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            ComboRepository comboRepository
    ) {
        this.campaignRepository = campaignRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.comboRepository = comboRepository;
    }

    @Transactional(readOnly = true)
    public Page<DiscountCampaignResponse> getAllForAdmin(
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

        return campaignRepository
                .findAll(pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<DiscountCampaignResponse>
    getActiveCampaigns() {
        LocalDateTime now = LocalDateTime.now();

        return campaignRepository
                .findByActiveTrueAndStartAtLessThanEqualAndEndAtGreaterThanEqualOrderByPriorityDesc(
                        now,
                        now
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DiscountCampaignResponse getById(Long id) {
        return toResponse(findEntityById(id));
    }

    @Transactional
    public DiscountCampaignResponse create(
            DiscountCampaignRequest request
    ) {
        String normalizedCode =
                request.code()
                        .trim()
                        .toUpperCase();

        if (campaignRepository
                .existsByCodeIgnoreCase(normalizedCode)) {
            throw new BadRequestException(
                    "Mã khuyến mãi đã tồn tại"
            );
        }

        validateRequest(request);

        DiscountCampaign campaign =
                new DiscountCampaign();

        campaign.setCode(normalizedCode);
        applyRequest(campaign, request);

        return toResponse(
                campaignRepository.save(campaign)
        );
    }

    @Transactional
    public DiscountCampaignResponse update(
            Long id,
            DiscountCampaignRequest request
    ) {
        DiscountCampaign campaign =
                findEntityById(id);

        String normalizedCode =
                request.code()
                        .trim()
                        .toUpperCase();

        if (campaignRepository
                .existsByCodeIgnoreCaseAndIdNot(
                        normalizedCode,
                        id
                )) {
            throw new BadRequestException(
                    "Mã khuyến mãi đã tồn tại"
            );
        }

        validateRequest(request);

        campaign.setCode(normalizedCode);
        applyRequest(campaign, request);

        return toResponse(
                campaignRepository.save(campaign)
        );
    }

    @Transactional
    public void deactivate(Long id) {
        DiscountCampaign campaign =
                findEntityById(id);

        campaign.setActive(false);

        campaignRepository.save(campaign);
    }

    @Transactional(readOnly = true)
    public DiscountPriceResponse calculateProductPrice(
            Long productId
    ) {
        Product product =
                productRepository.findById(productId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Không tìm thấy sản phẩm có ID "
                                                + productId
                                )
                        );

        return calculateForProduct(product);
    }

    @Transactional(readOnly = true)
    public DiscountPriceResponse calculateComboPrice(
            Long comboId
    ) {
        Combo combo =
                comboRepository.findById(comboId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Không tìm thấy combo có ID "
                                                + comboId
                                )
                        );

        return calculateForCombo(combo);
    }

    @Transactional(readOnly = true)
    public DiscountPriceResponse calculateForProduct(
            Product product
    ) {
        LocalDateTime now = LocalDateTime.now();

        List<DiscountCampaign> applicable =
                campaignRepository
                        .findByActiveTrueAndStartAtLessThanEqualAndEndAtGreaterThanEqualOrderByPriorityDesc(
                                now,
                                now
                        )
                        .stream()
                        .filter(campaign ->
                                appliesToProduct(
                                        campaign,
                                        product
                                )
                        )
                        .toList();

        return calculateBestPrice(
                product.getPrice(),
                applicable
        );
    }

    @Transactional(readOnly = true)
    public DiscountPriceResponse calculateForCombo(
            Combo combo
    ) {
        LocalDateTime now = LocalDateTime.now();

        List<DiscountCampaign> applicable =
                campaignRepository
                        .findByActiveTrueAndStartAtLessThanEqualAndEndAtGreaterThanEqualOrderByPriorityDesc(
                                now,
                                now
                        )
                        .stream()
                        .filter(campaign ->
                                appliesToCombo(
                                        campaign,
                                        combo
                                )
                        )
                        .toList();

        return calculateBestPrice(
                combo.getComboPrice(),
                applicable
        );
    }

    @Transactional(readOnly = true)
    public DiscountCampaign findEntityById(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy chương trình giảm giá có ID "
                                        + id
                        )
                );
    }

    private void applyRequest(
            DiscountCampaign campaign,
            DiscountCampaignRequest request
    ) {
        campaign.setName(request.name().trim());
        campaign.setDescription(
                normalizeNullable(request.description())
        );
        campaign.setDiscountType(
                request.discountType()
        );
        campaign.setDiscountValue(
                request.discountValue()
        );
        campaign.setMaximumDiscountAmount(
                request.maximumDiscountAmount()
        );
        campaign.setDiscountScope(
                request.discountScope()
        );
        campaign.setPriority(
                request.priority() == null
                        ? 0
                        : request.priority()
        );
        campaign.setActive(
                request.active() == null
                        || request.active()
        );
        campaign.setStartAt(request.startAt());
        campaign.setEndAt(request.endAt());

        applyTarget(campaign, request);
    }

    private void applyTarget(
            DiscountCampaign campaign,
            DiscountCampaignRequest request
    ) {
        campaign.setCategory(null);
        campaign.setProduct(null);
        campaign.setCombo(null);

        switch (request.discountScope()) {
            case STORE -> {
                if (request.categoryId() != null
                        || request.productId() != null
                        || request.comboId() != null) {
                    throw new BadRequestException(
                            "Khuyến mãi toàn cửa hàng không được chọn đối tượng riêng"
                    );
                }
            }

            case CATEGORY -> {
                if (request.categoryId() == null) {
                    throw new BadRequestException(
                            "Phải chọn danh mục được giảm giá"
                    );
                }

                if (request.productId() != null
                        || request.comboId() != null) {
                    throw new BadRequestException(
                            "Khuyến mãi danh mục không được chọn sản phẩm hoặc combo"
                    );
                }

                Category category =
                        categoryRepository
                                .findById(request.categoryId())
                                .orElseThrow(() ->
                                        new ResourceNotFoundException(
                                                "Không tìm thấy danh mục có ID "
                                                        + request.categoryId()
                                        )
                                );

                campaign.setCategory(category);
            }

            case PRODUCT -> {
                if (request.productId() == null) {
                    throw new BadRequestException(
                            "Phải chọn sản phẩm được giảm giá"
                    );
                }

                if (request.categoryId() != null
                        || request.comboId() != null) {
                    throw new BadRequestException(
                            "Khuyến mãi sản phẩm không được chọn danh mục hoặc combo"
                    );
                }

                Product product =
                        productRepository
                                .findById(request.productId())
                                .orElseThrow(() ->
                                        new ResourceNotFoundException(
                                                "Không tìm thấy sản phẩm có ID "
                                                        + request.productId()
                                        )
                                );

                campaign.setProduct(product);
            }

            case COMBO -> {
                if (request.comboId() == null) {
                    throw new BadRequestException(
                            "Phải chọn combo được giảm giá"
                    );
                }

                if (request.categoryId() != null
                        || request.productId() != null) {
                    throw new BadRequestException(
                            "Khuyến mãi combo không được chọn danh mục hoặc sản phẩm"
                    );
                }

                Combo combo =
                        comboRepository
                                .findById(request.comboId())
                                .orElseThrow(() ->
                                        new ResourceNotFoundException(
                                                "Không tìm thấy combo có ID "
                                                        + request.comboId()
                                        )
                                );

                campaign.setCombo(combo);
            }
        }
    }

    private void validateRequest(
            DiscountCampaignRequest request
    ) {
        if (!request.startAt().isBefore(
                request.endAt()
        )) {
            throw new BadRequestException(
                    "Thời gian bắt đầu phải trước thời gian kết thúc"
            );
        }

        if (request.discountType()
                == DiscountType.PERCENTAGE) {

            if (request.discountValue()
                    .compareTo(ONE_HUNDRED) > 0) {
                throw new BadRequestException(
                        "Phần trăm giảm không được lớn hơn 100"
                );
            }
        }

        if (request.discountType()
                == DiscountType.FIXED_AMOUNT
                && request.maximumDiscountAmount() != null) {
            throw new BadRequestException(
                    "Giảm số tiền cố định không cần mức giảm tối đa"
            );
        }
    }

    private boolean appliesToProduct(
            DiscountCampaign campaign,
            Product product
    ) {
        return switch (
                campaign.getDiscountScope()
                ) {
            case STORE -> true;

            case CATEGORY ->
                    campaign.getCategory() != null
                            && product.getCategory() != null
                            && campaign.getCategory()
                            .getId()
                            .equals(
                                    product.getCategory()
                                            .getId()
                            );

            case PRODUCT ->
                    campaign.getProduct() != null
                            && campaign.getProduct()
                            .getId()
                            .equals(product.getId());

            case COMBO -> false;
        };
    }

    private boolean appliesToCombo(
            DiscountCampaign campaign,
            Combo combo
    ) {
        return switch (
                campaign.getDiscountScope()
                ) {
            case STORE -> true;

            case COMBO ->
                    campaign.getCombo() != null
                            && campaign.getCombo()
                            .getId()
                            .equals(combo.getId());

            case CATEGORY, PRODUCT -> false;
        };
    }

    private DiscountPriceResponse calculateBestPrice(
            BigDecimal originalPrice,
            List<DiscountCampaign> campaigns
    ) {
        DiscountCampaign bestCampaign = null;
        BigDecimal bestDiscount =
                BigDecimal.ZERO;
        int bestPriority =
                Integer.MIN_VALUE;

        for (DiscountCampaign campaign : campaigns) {
            BigDecimal discountAmount =
                    calculateDiscountAmount(
                            originalPrice,
                            campaign
                    );

            int compare =
                    discountAmount.compareTo(
                            bestDiscount
                    );

            int campaignPriority =
                    campaign.getPriority() == null
                            ? 0
                            : campaign.getPriority();

            if (compare > 0
                    || (
                    compare == 0
                            && campaignPriority
                            > bestPriority
            )) {
                bestCampaign = campaign;
                bestDiscount = discountAmount;
                bestPriority = campaignPriority;
            }
        }

        BigDecimal finalPrice =
                originalPrice
                        .subtract(bestDiscount)
                        .max(BigDecimal.ZERO)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        if (bestCampaign == null) {
            return new DiscountPriceResponse(
                    null,
                    null,
                    null,
                    originalPrice,
                    BigDecimal.ZERO,
                    originalPrice
            );
        }

        return new DiscountPriceResponse(
                bestCampaign.getId(),
                bestCampaign.getCode(),
                bestCampaign.getName(),
                originalPrice,
                bestDiscount,
                finalPrice
        );
    }

    private BigDecimal calculateDiscountAmount(
            BigDecimal originalPrice,
            DiscountCampaign campaign
    ) {
        BigDecimal discountAmount;

        if (campaign.getDiscountType()
                == DiscountType.PERCENTAGE) {

            discountAmount =
                    originalPrice
                            .multiply(
                                    campaign.getDiscountValue()
                            )
                            .divide(
                                    ONE_HUNDRED,
                                    2,
                                    RoundingMode.HALF_UP
                            );

            BigDecimal maximum =
                    campaign.getMaximumDiscountAmount();

            if (maximum != null
                    && discountAmount.compareTo(
                    maximum
            ) > 0) {
                discountAmount = maximum;
            }
        } else {
            discountAmount =
                    campaign.getDiscountValue();
        }

        if (discountAmount.compareTo(
                originalPrice
        ) > 0) {
            discountAmount = originalPrice;
        }

        return discountAmount
                .max(BigDecimal.ZERO)
                .setScale(
                        2,
                        RoundingMode.HALF_UP
                );
    }

    private DiscountCampaignResponse toResponse(
            DiscountCampaign campaign
    ) {
        LocalDateTime now = LocalDateTime.now();

        boolean currentlyEffective =
                Boolean.TRUE.equals(campaign.getActive())
                        && !now.isBefore(
                        campaign.getStartAt()
                )
                        && !now.isAfter(
                        campaign.getEndAt()
                );

        return new DiscountCampaignResponse(
                campaign.getId(),
                campaign.getCode(),
                campaign.getName(),
                campaign.getDescription(),
                campaign.getDiscountType(),
                campaign.getDiscountValue(),
                campaign.getMaximumDiscountAmount(),
                campaign.getDiscountScope(),

                campaign.getCategory() == null
                        ? null
                        : campaign.getCategory().getId(),

                campaign.getCategory() == null
                        ? null
                        : campaign.getCategory().getName(),

                campaign.getProduct() == null
                        ? null
                        : campaign.getProduct().getId(),

                campaign.getProduct() == null
                        ? null
                        : campaign.getProduct().getName(),

                campaign.getCombo() == null
                        ? null
                        : campaign.getCombo().getId(),

                campaign.getCombo() == null
                        ? null
                        : campaign.getCombo().getName(),

                campaign.getPriority(),
                campaign.getActive(),
                currentlyEffective,
                campaign.getStartAt(),
                campaign.getEndAt(),
                campaign.getCreatedAt(),
                campaign.getUpdatedAt()
        );
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();

        return trimmed.isEmpty()
                ? null
                : trimmed;
    }
}