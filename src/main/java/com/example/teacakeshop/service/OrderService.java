package com.example.teacakeshop.service;

import com.example.teacakeshop.constant.CartItemType;
import com.example.teacakeshop.constant.OrderStatus;
import com.example.teacakeshop.constant.OrderType;
import com.example.teacakeshop.constant.PaymentPurpose;
import com.example.teacakeshop.constant.PaymentStatus;
import com.example.teacakeshop.dto.request.CheckoutRequest;
import com.example.teacakeshop.dto.response.DiscountPriceResponse;
import com.example.teacakeshop.dto.response.OrderItemResponse;
import com.example.teacakeshop.dto.response.OrderResponse;
import com.example.teacakeshop.dto.response.OrderSummaryResponse;
import com.example.teacakeshop.dto.response.VoucherPreviewResponse;
import com.example.teacakeshop.entity.Cart;
import com.example.teacakeshop.entity.CartItem;
import com.example.teacakeshop.entity.Combo;
import com.example.teacakeshop.entity.ComboItem;
import com.example.teacakeshop.entity.CustomerOrder;
import com.example.teacakeshop.entity.OrderItem;
import com.example.teacakeshop.entity.Product;
import com.example.teacakeshop.entity.UserAccount;
import com.example.teacakeshop.exception.BadRequestException;
import com.example.teacakeshop.exception.ResourceNotFoundException;
import com.example.teacakeshop.repository.CartRepository;
import com.example.teacakeshop.repository.ComboRepository;
import com.example.teacakeshop.repository.CustomerOrderRepository;
import com.example.teacakeshop.repository.ProductRepository;
import com.example.teacakeshop.repository.PaymentRepository;
import com.example.teacakeshop.repository.UserAccountRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class OrderService {

    private static final BigDecimal DEPOSIT_RATE =
            new BigDecimal("0.50");

    private final CustomerOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ComboRepository comboRepository;
    private final CartRepository cartRepository;
    private final UserAccountRepository userAccountRepository;
    private final CartService cartService;
    private final DiscountService discountService;
    private final PaymentRepository paymentRepository;

    public OrderService(
            CustomerOrderRepository orderRepository,
            ProductRepository productRepository,
            ComboRepository comboRepository,
            CartRepository cartRepository,
            UserAccountRepository userAccountRepository,
            CartService cartService,
            DiscountService discountService,
            PaymentRepository paymentRepository
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.comboRepository = comboRepository;
        this.cartRepository = cartRepository;
        this.userAccountRepository =
                userAccountRepository;
        this.cartService = cartService;
        this.discountService = discountService;
        this.paymentRepository = paymentRepository;
    }

    /*
     * Chuyển giỏ hàng thành đơn hàng.
     *
     * authenticatedEmail:
     * - Có giá trị: đơn được gắn với UserAccount.
     * - null/rỗng: đơn của khách vãng lai.
     */
    @Transactional
    public OrderResponse checkout(
            CheckoutRequest request,
            String authenticatedEmail
    ) {
        Cart cart =
                cartService.findActiveCartByToken(
                        request.cartToken()
                );

        if (cart.getItems() == null
                || cart.getItems().isEmpty()) {

            throw new BadRequestException(
                    "Giỏ hàng đang trống"
            );
        }

        validateCheckoutRequest(request);

        if (request.orderType()
                == OrderType.RESERVATION_COMBO
                && cart.getItems()
                .stream()
                .noneMatch(item ->
                        item.getCombo() != null
                )) {
            throw new BadRequestException(
                    "Đơn combo đặt bàn phải có ít nhất một combo"
            );
        }

        /*
         * Tổng số lượng từng sản phẩm cần trừ kho.
         *
         * Bao gồm:
         * - Sản phẩm mua lẻ
         * - Sản phẩm nằm trong combo
         */
        Map<Long, Integer> stockRequirements =
                new LinkedHashMap<>();

        Map<Long, Product> productsById =
                new LinkedHashMap<>();

        List<OrderItem> orderItems =
                new ArrayList<>();

        BigDecimal totalAmount =
                BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {

            if (cartItem.getProduct() != null) {

                Product product =
                        cartItem.getProduct();

                validateProduct(
                        product,
                        cartItem.getQuantity()
                );

                addStockRequirement(
                        stockRequirements,
                        productsById,
                        product,
                        cartItem.getQuantity()
                );

                OrderItem orderItem =
                        createProductOrderItem(
                                product,
                                cartItem.getQuantity()
                        );

                orderItems.add(orderItem);

                totalAmount =
                        totalAmount.add(
                                orderItem.getLineTotal()
                        );

            } else if (cartItem.getCombo() != null) {

                Combo combo =
                        cartItem.getCombo();

                validateCombo(
                        combo,
                        cartItem.getQuantity()
                );

                for (ComboItem comboItem :
                        combo.getItems()) {

                    int requiredQuantity =
                            comboItem.getQuantity()
                                    * cartItem.getQuantity();

                    addStockRequirement(
                            stockRequirements,
                            productsById,
                            comboItem.getProduct(),
                            requiredQuantity
                    );
                }

                OrderItem orderItem =
                        createComboOrderItem(
                                combo,
                                cartItem.getQuantity()
                        );

                orderItems.add(orderItem);

                totalAmount =
                        totalAmount.add(
                                orderItem.getLineTotal()
                        );

            } else {
                throw new BadRequestException(
                        "Dòng giỏ hàng không hợp lệ"
                );
            }
        }

        /*
         * Kiểm tra tổng tồn kho sau khi cộng
         * cả món lẻ và sản phẩm trong combo.
         */
        validateTotalStock(
                stockRequirements,
                productsById
        );

        VoucherPreviewResponse voucher = null;
        if (request.voucherCode() != null
                && !request.voucherCode().isBlank()) {
            voucher = discountService.previewVoucher(
                    request.voucherCode(),
                    totalAmount,
                    request.orderType()
            );
            totalAmount = voucher.finalAmount();
        }

        boolean depositRequired =
                request.orderType()
                        == OrderType.TAKEAWAY_PREORDER
                        || request.orderType()
                        == OrderType.RESERVATION_COMBO;

        BigDecimal depositAmount =
                depositRequired
                        ? totalAmount
                        .multiply(DEPOSIT_RATE)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        )
                        : BigDecimal.ZERO;

        BigDecimal remainingAmount =
                totalAmount.subtract(
                        depositAmount
                );

        CustomerOrder order =
                new CustomerOrder();

        /*
         * Phần 245:
         * Có email xác thực thì gắn đơn hàng
         * với tài khoản đang đăng nhập.
         */
        if (authenticatedEmail != null
                && !authenticatedEmail.isBlank()) {

            UserAccount account =
                    findUserByEmail(
                            authenticatedEmail
                    );

            order.setUserAccount(account);
        }

        order.setOrderCode(
                generateOrderCode()
        );

        order.setCustomerName(
                request.customerName().trim()
        );

        order.setCustomerPhone(
                request.customerPhone().trim()
        );

        order.setCustomerEmail(
                normalizeNullable(
                        request.customerEmail()
                )
        );

        order.setShippingAddress(
                normalizeNullable(
                        request.shippingAddress()
                )
        );

        order.setOrderType(
                request.orderType()
        );

        order.setStatus(
                OrderStatus.PENDING
        );

        order.setTotalAmount(
                totalAmount
        );

        if (voucher != null) {
            order.setVoucherCode(voucher.code());
            order.setVoucherName(voucher.name());
            order.setVoucherDiscountAmount(
                    voucher.discountAmount()
            );
        }

        order.setDepositRequired(
                depositRequired
        );

        order.setDepositAmount(
                depositAmount
        );

        order.setRemainingAmount(
                remainingAmount
        );

        order.setPickupTime(
                request.pickupTime()
        );

        order.setNote(
                normalizeNullable(
                        request.note()
                )
        );

        for (OrderItem item : orderItems) {
            order.addItem(item);
        }

        /*
         * Trừ tồn kho sau khi tất cả
         * các bước kiểm tra đều hợp lệ.
         */
        for (Map.Entry<Long, Integer> entry :
                stockRequirements.entrySet()) {

            Product product =
                    productsById.get(
                            entry.getKey()
                    );

            int currentStock =
                    product.getStockQuantity() == null
                            ? 0
                            : product.getStockQuantity();

            product.setStockQuantity(
                    currentStock
                            - entry.getValue()
            );
        }

        productRepository.saveAll(
                productsById.values()
        );

        CustomerOrder savedOrder =
                orderRepository.save(order);

        /*
         * Giỏ hàng không còn sử dụng
         * sau khi checkout.
         */
        cart.clearItems();
        cart.setActive(false);

        cartRepository.save(cart);

        return toResponse(savedOrder);
    }

    /*
     * Giữ method cũ để các đoạn code chưa sửa
     * vẫn có thể gọi checkout(request).
     *
     * Method này tạo đơn khách vãng lai.
     */
    @Transactional
    public OrderResponse checkout(
            CheckoutRequest request
    ) {
        return checkout(
                request,
                null
        );
    }

    /*
     * Khách vãng lai xem đơn bằng
     * mã đơn và số điện thoại.
     */
    @Transactional(readOnly = true)
    public OrderResponse getPublicOrder(
            String orderCode,
            String customerPhone
    ) {
        CustomerOrder order =
                orderRepository
                        .findByOrderCodeAndCustomerPhone(
                                orderCode,
                                customerPhone
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Không tìm thấy đơn hàng"
                                )
                        );

        return toResponse(order);
    }

    /*
     * User đã đăng nhập xem đơn bằng orderCode.
     * Validate đơn phải thuộc về user đó.
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderByCodeForUser(
            String orderCode,
            String authenticatedEmail
    ) {
        UserAccount account =
                findUserByEmail(authenticatedEmail);

        CustomerOrder order =
                orderRepository
                        .findByOrderCodeAndUserAccount_Id(
                                orderCode,
                                account.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Không tìm thấy đơn hàng"
                                )
                        );

        return toResponse(order);
    }

    /*
     * Admin xem danh sách đơn hàng.
     */
    @Transactional(readOnly = true)
    public Page<OrderSummaryResponse> getAllForAdmin(
            OrderStatus status,
            OrderType orderType,
            String keyword,
            LocalDate startDate,
            LocalDate endDate,
            int page,
            int size
    ) {
        int safePage =
                Math.max(page, 0);

        int safeSize =
                Math.min(
                        Math.max(size, 1),
                        100
                );

        Pageable pageable =
                PageRequest.of(
                        safePage,
                        safeSize,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        Specification<CustomerOrder> specification =
                (root, query, builder) -> {
                    List<jakarta.persistence.criteria.Predicate> predicates =
                            new ArrayList<>();

                    if (status != null) {
                        predicates.add(
                                builder.equal(
                                        root.get("status"),
                                        status
                                )
                        );
                    }

                    if (orderType != null) {
                        predicates.add(
                                builder.equal(
                                        root.get("orderType"),
                                        orderType
                                )
                        );
                    }

                    if (keyword != null
                            && !keyword.isBlank()) {
                        String pattern =
                                "%"
                                        + keyword.trim()
                                        .toLowerCase(Locale.ROOT)
                                        + "%";

                        predicates.add(
                                builder.or(
                                        builder.like(
                                                builder.lower(root.get("orderCode")),
                                                pattern
                                        ),
                                        builder.like(
                                                builder.lower(root.get("customerName")),
                                                pattern
                                        ),
                                        builder.like(
                                                root.get("customerPhone"),
                                                pattern
                                        )
                                )
                        );
                    }

                    if (startDate != null) {
                        predicates.add(
                                builder.greaterThanOrEqualTo(
                                        root.get("createdAt"),
                                        startDate.atStartOfDay()
                                )
                        );
                    }

                    if (endDate != null) {
                        predicates.add(
                                builder.lessThan(
                                        root.get("createdAt"),
                                        endDate.plusDays(1).atStartOfDay()
                                )
                        );
                    }

                    return builder.and(
                            predicates.toArray(
                                    jakarta.persistence.criteria.Predicate[]::new
                            )
                    );
                };

        Page<CustomerOrder> orderPage =
                orderRepository.findAll(
                        specification,
                        pageable
                );

        return orderPage.map(
                this::toSummaryResponse
        );
    }

    @Transactional(readOnly = true)
    public OrderResponse getByIdForAdmin(
            Long id
    ) {
        return toResponse(
                findEntityById(id)
        );
    }

    /*
     * Admin cập nhật trạng thái đơn.
     */
    @Transactional
    public OrderResponse updateStatus(
            Long orderId,
            OrderStatus newStatus
    ) {
        CustomerOrder order =
                findEntityById(orderId);

        OrderStatus currentStatus =
                order.getStatus();

        if (currentStatus == newStatus) {
            throw new BadRequestException(
                    "Đơn hàng đã ở trạng thái "
                            + newStatus
            );
        }

        if (!isTransitionAllowed(
                currentStatus,
                newStatus
        )) {
            throw new BadRequestException(
                    "Không thể chuyển trạng thái từ "
                            + currentStatus
                            + " sang "
                            + newStatus
            );
        }

        if (newStatus == OrderStatus.CONFIRMED
                && Boolean.TRUE.equals(order.getDepositRequired())
                && !paymentRepository
                .existsByCustomerOrder_IdAndPurposeAndStatus(
                        orderId,
                        PaymentPurpose.DEPOSIT,
                        PaymentStatus.PAID
                )) {
            throw new BadRequestException(
                    "Không thể xác nhận đơn khi tiền cọc chưa được thanh toán"
            );
        }

        /*
         * Khi hủy đơn, hoàn lại tồn kho.
         */
        if (newStatus == OrderStatus.CANCELLED) {
            if (paymentRepository
                    .existsByCustomerOrder_IdAndStatus(
                            orderId,
                            PaymentStatus.PAID
                    )) {
                throw new BadRequestException(
                        "Đơn hàng đã có thanh toán. "
                                + "Cần Admin xử lý hoàn tiền trước khi hủy"
                );
            }

            restoreStock(order);
        }

        /*
         * Khi hoàn tất, tăng số lượng đã bán.
         */
        if (newStatus == OrderStatus.COMPLETED) {
            increaseSoldQuantities(order);
        }

        order.setStatus(newStatus);

        CustomerOrder savedOrder =
                orderRepository.save(order);

        return toResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public CustomerOrder findEntityById(
            Long id
    ) {
        return orderRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy đơn hàng có ID "
                                        + id
                        )
                );
    }

    private void validateCheckoutRequest(
            CheckoutRequest request
    ) {
        if (request.orderType() == null) {
            throw new BadRequestException(
                    "Loại đơn hàng không được để trống"
            );
        }

        if (request.orderType()
                == OrderType.NORMAL) {

            if (request.shippingAddress() == null
                    || request.shippingAddress()
                    .trim()
                    .isEmpty()) {

                throw new BadRequestException(
                        "Đơn giao hàng phải có địa chỉ nhận hàng"
                );
            }
        }

        if (request.orderType()
                == OrderType.TAKEAWAY_PREORDER
                || request.orderType()
                == OrderType.RESERVATION_COMBO) {

            if (request.pickupTime() == null) {
                throw new BadRequestException(
                        "Đơn đặt trước phải có thời gian nhận hàng"
                );
            }

            LocalDateTime minimumPickupTime =
                    LocalDateTime.now()
                            .plusHours(2);

            if (request.pickupTime()
                    .isBefore(minimumPickupTime)) {

                throw new BadRequestException(
                        "Thời gian nhận hàng phải cách hiện tại ít nhất 2 giờ"
                );
            }
        }
    }

    private void validateProduct(
            Product product,
            Integer quantity
    ) {
        if (Boolean.FALSE.equals(
                product.getActive()
        )) {
            throw new BadRequestException(
                    "Sản phẩm "
                            + product.getName()
                            + " đang ngừng bán"
            );
        }
        if (product.getCategory() == null
                || Boolean.FALSE.equals(
                product.getCategory().getActive()
        )) {
            throw new BadRequestException(
                    "Danh mục của sản phẩm "
                            + product.getName()
                            + " đang ngừng bán"
            );
        }

        if (quantity == null
                || quantity <= 0) {

            throw new BadRequestException(
                    "Số lượng sản phẩm không hợp lệ"
            );
        }
    }

    private void validateCombo(
            Combo combo,
            Integer quantity
    ) {
        if (Boolean.FALSE.equals(
                combo.getActive()
        )) {
            throw new BadRequestException(
                    "Combo "
                            + combo.getName()
                            + " đang ngừng bán"
            );
        }

        if (quantity == null
                || quantity <= 0) {

            throw new BadRequestException(
                    "Số lượng combo không hợp lệ"
            );
        }

        LocalDate today =
                LocalDate.now();

        if (combo.getStartDate() != null
                && today.isBefore(
                combo.getStartDate()
        )) {
            throw new BadRequestException(
                    "Combo "
                            + combo.getName()
                            + " chưa đến thời gian bán"
            );
        }

        if (combo.getEndDate() != null
                && today.isAfter(
                combo.getEndDate()
        )) {
            throw new BadRequestException(
                    "Combo "
                            + combo.getName()
                            + " đã hết hạn"
            );
        }

        if (combo.getItems() == null
                || combo.getItems().isEmpty()) {

            throw new BadRequestException(
                    "Combo không có sản phẩm"
            );
        }
    }

    private void addStockRequirement(
            Map<Long, Integer> requirements,
            Map<Long, Product> productsById,
            Product product,
            Integer quantity
    ) {
        requirements.merge(
                product.getId(),
                quantity,
                Integer::sum
        );

        productsById.put(
                product.getId(),
                product
        );
    }

    private void validateTotalStock(
            Map<Long, Integer> requirements,
            Map<Long, Product> productsById
    ) {
        for (Map.Entry<Long, Integer> entry :
                requirements.entrySet()) {

            Product product =
                    productsById.get(
                            entry.getKey()
                    );

            int requiredQuantity =
                    entry.getValue();

            if (Boolean.FALSE.equals(
                    product.getActive()
            )) {
                throw new BadRequestException(
                        "Sản phẩm "
                                + product.getName()
                                + " đang ngừng bán"
                );
            }
            if (product.getCategory() == null
                    || Boolean.FALSE.equals(
                    product.getCategory().getActive()
            )) {
                throw new BadRequestException(
                        "Danh mục của sản phẩm "
                                + product.getName()
                                + " đang ngừng bán"
                );
            }

            int stockQuantity =
                    product.getStockQuantity() == null
                            ? 0
                            : product.getStockQuantity();

            if (stockQuantity < requiredQuantity) {
                throw new BadRequestException(
                        "Sản phẩm "
                                + product.getName()
                                + " chỉ còn "
                                + stockQuantity
                                + ", nhưng đơn hàng cần "
                                + requiredQuantity
                );
            }
        }
    }

    /*
     * Tạo OrderItem cho sản phẩm
     * và áp dụng giảm giá.
     */
    private OrderItem createProductOrderItem(
            Product product,
            Integer quantity
    ) {
        DiscountPriceResponse discount =
                discountService.calculateForProduct(
                        product
                );

        BigDecimal finalUnitPrice =
                discount.finalPrice();

        BigDecimal lineTotal =
                finalUnitPrice.multiply(
                        BigDecimal.valueOf(quantity)
                );

        OrderItem item =
                new OrderItem();

        item.setItemType(
                CartItemType.PRODUCT
        );

        item.setProduct(product);
        item.setCombo(null);

        item.setItemName(
                product.getName()
        );

        item.setImageUrl(
                product.getImageUrl()
        );

        item.setOriginalUnitPrice(
                discount.originalPrice()
        );

        item.setDiscountAmount(
                discount.discountAmount()
        );

        item.setDiscountCode(
                discount.campaignCode()
        );

        item.setDiscountName(
                discount.campaignName()
        );

        item.setUnitPrice(
                finalUnitPrice
        );

        item.setQuantity(
                quantity
        );

        item.setLineTotal(
                lineTotal
        );

        return item;
    }

    /*
     * Tạo OrderItem cho combo
     * và áp dụng giảm giá.
     */
    private OrderItem createComboOrderItem(
            Combo combo,
            Integer quantity
    ) {
        DiscountPriceResponse discount =
                discountService.calculateForCombo(
                        combo
                );

        BigDecimal finalUnitPrice =
                discount.finalPrice();

        BigDecimal lineTotal =
                finalUnitPrice.multiply(
                        BigDecimal.valueOf(quantity)
                );

        OrderItem item =
                new OrderItem();

        item.setItemType(
                CartItemType.COMBO
        );

        item.setProduct(null);
        item.setCombo(combo);

        item.setItemName(
                combo.getName()
        );

        item.setImageUrl(
                combo.getImageUrl()
        );

        item.setOriginalUnitPrice(
                discount.originalPrice()
        );

        item.setDiscountAmount(
                discount.discountAmount()
        );

        item.setDiscountCode(
                discount.campaignCode()
        );

        item.setDiscountName(
                discount.campaignName()
        );

        item.setUnitPrice(
                finalUnitPrice
        );

        item.setQuantity(
                quantity
        );

        item.setLineTotal(
                lineTotal
        );

        return item;
    }

    /*
     * Hoàn lại tồn kho khi đơn bị hủy.
     */
    private void restoreStock(
            CustomerOrder order
    ) {
        Map<Long, Product> products =
                new LinkedHashMap<>();

        Map<Long, Integer> quantities =
                new LinkedHashMap<>();

        for (OrderItem item :
                order.getItems()) {

            if (item.getItemType()
                    == CartItemType.PRODUCT) {

                Product product =
                        item.getProduct();

                quantities.merge(
                        product.getId(),
                        item.getQuantity(),
                        Integer::sum
                );

                products.put(
                        product.getId(),
                        product
                );

            } else if (item.getItemType()
                    == CartItemType.COMBO) {

                Combo combo =
                        item.getCombo();

                for (ComboItem comboItem :
                        combo.getItems()) {

                    Product product =
                            comboItem.getProduct();

                    int restoreQuantity =
                            comboItem.getQuantity()
                                    * item.getQuantity();

                    quantities.merge(
                            product.getId(),
                            restoreQuantity,
                            Integer::sum
                    );

                    products.put(
                            product.getId(),
                            product
                    );
                }
            }
        }

        for (Map.Entry<Long, Integer> entry :
                quantities.entrySet()) {

            Product product =
                    products.get(
                            entry.getKey()
                    );

            int currentStock =
                    product.getStockQuantity() == null
                            ? 0
                            : product.getStockQuantity();

            product.setStockQuantity(
                    currentStock
                            + entry.getValue()
            );
        }

        productRepository.saveAll(
                products.values()
        );
    }

    /*
     * Tăng số lượng đã bán khi hoàn tất đơn.
     */
    private void increaseSoldQuantities(
            CustomerOrder order
    ) {
        Map<Long, Product> products =
                new LinkedHashMap<>();

        Map<Long, Integer> soldProductQuantities =
                new LinkedHashMap<>();

        Map<Long, Combo> combos =
                new LinkedHashMap<>();

        Map<Long, Integer> soldComboQuantities =
                new LinkedHashMap<>();

        for (OrderItem item :
                order.getItems()) {

            if (item.getItemType()
                    == CartItemType.PRODUCT) {

                Product product =
                        item.getProduct();

                soldProductQuantities.merge(
                        product.getId(),
                        item.getQuantity(),
                        Integer::sum
                );

                products.put(
                        product.getId(),
                        product
                );

            } else if (item.getItemType()
                    == CartItemType.COMBO) {

                Combo combo =
                        item.getCombo();

                soldComboQuantities.merge(
                        combo.getId(),
                        item.getQuantity(),
                        Integer::sum
                );

                combos.put(
                        combo.getId(),
                        combo
                );

                /*
                 * Sản phẩm nằm trong combo
                 * cũng được tính là đã bán.
                 */
                for (ComboItem comboItem :
                        combo.getItems()) {

                    Product product =
                            comboItem.getProduct();

                    int soldQuantity =
                            comboItem.getQuantity()
                                    * item.getQuantity();

                    soldProductQuantities.merge(
                            product.getId(),
                            soldQuantity,
                            Integer::sum
                    );

                    products.put(
                            product.getId(),
                            product
                    );
                }
            }
        }

        for (Map.Entry<Long, Integer> entry :
                soldProductQuantities.entrySet()) {

            Product product =
                    products.get(
                            entry.getKey()
                    );

            int currentSoldQuantity =
                    product.getSoldQuantity() == null
                            ? 0
                            : product.getSoldQuantity();

            product.setSoldQuantity(
                    currentSoldQuantity
                            + entry.getValue()
            );
        }

        for (Map.Entry<Long, Integer> entry :
                soldComboQuantities.entrySet()) {

            Combo combo =
                    combos.get(
                            entry.getKey()
                    );

            int currentSoldQuantity =
                    combo.getSoldQuantity() == null
                            ? 0
                            : combo.getSoldQuantity();

            combo.setSoldQuantity(
                    currentSoldQuantity
                            + entry.getValue()
            );
        }

        productRepository.saveAll(
                products.values()
        );

        comboRepository.saveAll(
                combos.values()
        );
    }

    private boolean isTransitionAllowed(
            OrderStatus current,
            OrderStatus target
    ) {
        return switch (current) {
            case PENDING ->
                    target == OrderStatus.CONFIRMED
                            || target == OrderStatus.CANCELLED;

            case CONFIRMED ->
                    target == OrderStatus.PREPARING
                            || target == OrderStatus.CANCELLED;

            case PREPARING ->
                    target == OrderStatus.COMPLETED
                            || target == OrderStatus.CANCELLED;

            case COMPLETED, CANCELLED ->
                    false;
        };
    }

    private String generateOrderCode() {
        String code;

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern(
                        "yyyyMMddHHmmss"
                );

        do {
            String randomPart =
                    UUID.randomUUID()
                            .toString()
                            .replace("-", "")
                            .substring(0, 6)
                            .toUpperCase();

            code =
                    "ORD-"
                            + LocalDateTime.now()
                            .format(formatter)
                            + "-"
                            + randomPart;

        } while (
                orderRepository.existsByOrderCode(code)
        );

        return code;
    }

    /*
     * Tìm tài khoản theo email nhận từ JWT.
     */
    private UserAccount findUserByEmail(
            String email
    ) {
        String normalizedEmail =
                email.trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        return userAccountRepository
                .findByEmailIgnoreCase(
                        normalizedEmail
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy tài khoản"
                        )
                );
    }

    private String normalizeNullable(
            String value
    ) {
        if (value == null) {
            return null;
        }

        String trimmed =
                value.trim();

        return trimmed.isEmpty()
                ? null
                : trimmed;
    }

    private OrderSummaryResponse toSummaryResponse(
            CustomerOrder order
    ) {
        return new OrderSummaryResponse(
                order.getId(),
                order.getOrderCode(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getOrderType(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getDepositRequired(),
                order.getDepositAmount(),
                order.getRemainingAmount(),
                order.getPickupTime(),
                order.getCreatedAt()
        );
    }

    /*
     * Public để CustomerAccountService
     * chuyển entity thành response.
     */
    public OrderResponse toResponse(
            CustomerOrder order
    ) {
        List<OrderItemResponse> items =
                order.getItems()
                        .stream()
                        .map(this::toItemResponse)
                        .toList();

        return new OrderResponse(
                order.getId(),
                order.getOrderCode(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getCustomerEmail(),
                order.getShippingAddress(),
                order.getOrderType(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getVoucherCode(),
                order.getVoucherName(),
                order.getVoucherDiscountAmount(),
                order.getDepositRequired(),
                order.getDepositAmount(),
                order.getRemainingAmount(),
                order.getPickupTime(),
                order.getNote(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                items
        );
    }

    /*
     * Chuyển OrderItem sang response.
     *
     * Có xử lý tương thích với đơn hàng cũ
     * chưa có originalUnitPrice và discountAmount.
     */
    private OrderItemResponse toItemResponse(
            OrderItem item
    ) {
        Long itemId = null;

        if (item.getItemType()
                == CartItemType.PRODUCT
                && item.getProduct() != null) {

            itemId =
                    item.getProduct().getId();
        }

        if (item.getItemType()
                == CartItemType.COMBO
                && item.getCombo() != null) {

            itemId =
                    item.getCombo().getId();
        }

        BigDecimal originalUnitPrice =
                item.getOriginalUnitPrice() == null
                        ? item.getUnitPrice()
                        : item.getOriginalUnitPrice();

        BigDecimal discountAmount =
                item.getDiscountAmount() == null
                        ? BigDecimal.ZERO
                        : item.getDiscountAmount();

        return new OrderItemResponse(
                item.getId(),
                item.getItemType(),
                itemId,
                item.getItemName(),
                item.getImageUrl(),
                originalUnitPrice,
                discountAmount,
                item.getUnitPrice(),
                item.getQuantity(),
                item.getLineTotal(),
                item.getDiscountCode(),
                item.getDiscountName()
        );
    }
}
