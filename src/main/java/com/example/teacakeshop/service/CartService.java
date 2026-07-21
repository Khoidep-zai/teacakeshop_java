package com.example.teacakeshop.service;

import com.example.teacakeshop.constant.CartItemType;
import com.example.teacakeshop.dto.request.AddCartItemRequest;
import com.example.teacakeshop.dto.request.UpdateCartItemRequest;
import com.example.teacakeshop.dto.response.CartItemResponse;
import com.example.teacakeshop.dto.response.CartResponse;
import com.example.teacakeshop.dto.response.DiscountPriceResponse;
import com.example.teacakeshop.entity.Cart;
import com.example.teacakeshop.entity.CartItem;
import com.example.teacakeshop.entity.Combo;
import com.example.teacakeshop.entity.ComboItem;
import com.example.teacakeshop.entity.Product;
import com.example.teacakeshop.exception.BadRequestException;
import com.example.teacakeshop.exception.ResourceNotFoundException;
import com.example.teacakeshop.repository.CartItemRepository;
import com.example.teacakeshop.repository.CartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductService productService;
    private final ComboService comboService;
    private final DiscountService discountService;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductService productService,
            ComboService comboService,
            DiscountService discountService
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productService = productService;
        this.comboService = comboService;
        this.discountService = discountService;
    }

    /*
     * Tạo giỏ hàng mới.
     */
    @Transactional
    public CartResponse createCart() {
        Cart cart = new Cart();

        cart.setToken(generateUniqueToken());
        cart.setActive(true);

        Cart savedCart = cartRepository.save(cart);

        return toResponse(savedCart);
    }

    /*
     * Xem giỏ hàng theo token.
     */
    @Transactional(readOnly = true)
    public CartResponse getCart(String token) {
        Cart cart = findActiveCartByToken(token);

        return toResponse(cart);
    }

    /*
     * Thêm sản phẩm hoặc combo vào giỏ.
     */
    @Transactional
    public CartResponse addItem(
            String token,
            AddCartItemRequest request
    ) {
        Cart cart = findActiveCartByToken(token);

        if (request.itemType() == CartItemType.PRODUCT) {
            addProduct(
                    cart,
                    request.itemId(),
                    request.quantity()
            );
        } else if (request.itemType() == CartItemType.COMBO) {
            addCombo(
                    cart,
                    request.itemId(),
                    request.quantity()
            );
        } else {
            throw new BadRequestException(
                    "Loại món trong giỏ hàng không hợp lệ"
            );
        }

        cart.touch();

        Cart savedCart = cartRepository.save(cart);

        return toResponse(savedCart);
    }

    /*
     * Cập nhật số lượng một dòng trong giỏ.
     */
    @Transactional
    public CartResponse updateItemQuantity(
            String token,
            Long cartItemId,
            UpdateCartItemRequest request
    ) {
        Cart cart = findActiveCartByToken(token);

        CartItem cartItem = cartItemRepository
                .findByIdAndCart_Id(
                        cartItemId,
                        cart.getId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy món trong giỏ hàng"
                        )
                );

        Integer requestedQuantity = request.quantity();

        if (cartItem.getProduct() != null) {
            validateProductQuantity(
                    cartItem.getProduct(),
                    requestedQuantity
            );
        } else if (cartItem.getCombo() != null) {
            validateComboQuantity(
                    cartItem.getCombo(),
                    requestedQuantity
            );
        } else {
            throw new BadRequestException(
                    "Dòng giỏ hàng không hợp lệ"
            );
        }

        cartItem.setQuantity(requestedQuantity);
        cart.touch();

        cartItemRepository.save(cartItem);
        cartRepository.save(cart);

        return toResponse(cart);
    }

    /*
     * Xóa một dòng khỏi giỏ.
     */
    @Transactional
    public CartResponse removeItem(
            String token,
            Long cartItemId
    ) {
        Cart cart = findActiveCartByToken(token);

        CartItem cartItem = cartItemRepository
                .findByIdAndCart_Id(
                        cartItemId,
                        cart.getId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy món trong giỏ hàng"
                        )
                );

        cart.removeItem(cartItem);

        Cart savedCart = cartRepository.save(cart);

        return toResponse(savedCart);
    }

    /*
     * Xóa toàn bộ món trong giỏ.
     */
    @Transactional
    public CartResponse clearCart(String token) {
        Cart cart = findActiveCartByToken(token);

        cart.clearItems();

        Cart savedCart = cartRepository.save(cart);

        return toResponse(savedCart);
    }

    /*
     * Tìm giỏ đang hoạt động.
     * Method này còn được OrderService sử dụng khi checkout.
     */
    @Transactional(readOnly = true)
    public Cart findActiveCartByToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new BadRequestException(
                    "Token giỏ hàng không được để trống"
            );
        }

        return cartRepository
                .findByTokenAndActiveTrue(token.trim())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy giỏ hàng hoặc giỏ đã hết hiệu lực"
                        )
                );
    }

    /*
     * Thêm sản phẩm lẻ.
     */
    private void addProduct(
            Cart cart,
            Long productId,
            Integer addedQuantity
    ) {
        validatePositiveQuantity(addedQuantity);

        Product product =
                productService.findEntityById(productId);

        if (Boolean.FALSE.equals(product.getActive())) {
            throw new BadRequestException(
                    "Sản phẩm đang bị ẩn hoặc ngừng bán"
            );
        }

        CartItem existingItem = cartItemRepository
                .findByCart_IdAndProduct_Id(
                        cart.getId(),
                        productId
                )
                .orElse(null);

        int newQuantity = addedQuantity;

        if (existingItem != null) {
            newQuantity += existingItem.getQuantity();
        }

        validateProductQuantity(
                product,
                newQuantity
        );

        if (existingItem != null) {
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
            return;
        }

        CartItem cartItem = new CartItem();

        cartItem.setProduct(product);
        cartItem.setCombo(null);
        cartItem.setQuantity(addedQuantity);

        cart.addItem(cartItem);
    }

    /*
     * Thêm combo.
     */
    private void addCombo(
            Cart cart,
            Long comboId,
            Integer addedQuantity
    ) {
        validatePositiveQuantity(addedQuantity);

        Combo combo =
                comboService.findEntityById(comboId);

        validateComboCanBePurchased(combo);

        CartItem existingItem = cartItemRepository
                .findByCart_IdAndCombo_Id(
                        cart.getId(),
                        comboId
                )
                .orElse(null);

        int newQuantity = addedQuantity;

        if (existingItem != null) {
            newQuantity += existingItem.getQuantity();
        }

        validateComboQuantity(
                combo,
                newQuantity
        );

        if (existingItem != null) {
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
            return;
        }

        CartItem cartItem = new CartItem();

        cartItem.setProduct(null);
        cartItem.setCombo(combo);
        cartItem.setQuantity(addedQuantity);

        cart.addItem(cartItem);
    }

    private void validatePositiveQuantity(
            Integer quantity
    ) {
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException(
                    "Số lượng phải lớn hơn 0"
            );
        }
    }

    private void validateProductQuantity(
            Product product,
            Integer requestedQuantity
    ) {
        validatePositiveQuantity(requestedQuantity);

        if (Boolean.FALSE.equals(product.getActive())) {
            throw new BadRequestException(
                    "Sản phẩm đang bị ẩn hoặc ngừng bán"
            );
        }

        int stockQuantity =
                product.getStockQuantity() == null
                        ? 0
                        : product.getStockQuantity();

        if (requestedQuantity > stockQuantity) {
            throw new BadRequestException(
                    "Sản phẩm "
                            + product.getName()
                            + " chỉ còn "
                            + stockQuantity
                            + " sản phẩm"
            );
        }
    }

    private void validateComboQuantity(
            Combo combo,
            Integer requestedQuantity
    ) {
        validatePositiveQuantity(requestedQuantity);
        validateComboCanBePurchased(combo);

        int availableQuantity =
                calculateComboAvailableQuantity(combo);

        if (requestedQuantity > availableQuantity) {
            throw new BadRequestException(
                    "Combo "
                            + combo.getName()
                            + " chỉ còn khả năng phục vụ "
                            + availableQuantity
                            + " combo"
            );
        }
    }

    private void validateComboCanBePurchased(
            Combo combo
    ) {
        if (Boolean.FALSE.equals(combo.getActive())) {
            throw new BadRequestException(
                    "Combo đang bị ẩn hoặc ngừng bán"
            );
        }

        LocalDate today = LocalDate.now();

        if (combo.getStartDate() != null
                && today.isBefore(combo.getStartDate())) {
            throw new BadRequestException(
                    "Combo chưa đến thời gian mở bán"
            );
        }

        if (combo.getEndDate() != null
                && today.isAfter(combo.getEndDate())) {
            throw new BadRequestException(
                    "Combo đã hết thời gian áp dụng"
            );
        }

        if (combo.getItems() == null
                || combo.getItems().isEmpty()) {
            throw new BadRequestException(
                    "Combo không có sản phẩm"
            );
        }
    }

    /*
     * Tính số combo tối đa có thể bán dựa trên tồn kho
     * của các sản phẩm thành phần.
     */
    private int calculateComboAvailableQuantity(
            Combo combo
    ) {
        int availableQuantity =
                Integer.MAX_VALUE;

        for (ComboItem comboItem : combo.getItems()) {
            Product product =
                    comboItem.getProduct();

            if (product == null
                    || Boolean.FALSE.equals(product.getActive())) {
                return 0;
            }

            Integer requiredQuantity =
                    comboItem.getQuantity();

            if (requiredQuantity == null
                    || requiredQuantity <= 0) {
                return 0;
            }

            int stockQuantity =
                    product.getStockQuantity() == null
                            ? 0
                            : product.getStockQuantity();

            int possibleQuantity =
                    stockQuantity / requiredQuantity;

            availableQuantity =
                    Math.min(
                            availableQuantity,
                            possibleQuantity
                    );
        }

        if (availableQuantity == Integer.MAX_VALUE) {
            return 0;
        }

        return availableQuantity;
    }

    private String generateUniqueToken() {
        String token;

        do {
            token = UUID.randomUUID()
                    .toString()
                    .replace("-", "");
        } while (cartRepository.existsByToken(token));

        return token;
    }

    /*
     * Chuyển Cart thành CartResponse và tính tổng tiền sau giảm.
     */
    private CartResponse toResponse(
            Cart cart
    ) {
        List<CartItemResponse> itemResponses =
                cart.getItems()
                        .stream()
                        .map(this::toItemResponse)
                        .toList();

        int totalQuantity =
                itemResponses
                        .stream()
                        .mapToInt(
                                CartItemResponse::quantity
                        )
                        .sum();

        BigDecimal totalAmount =
                itemResponses
                        .stream()
                        .map(
                                CartItemResponse::lineTotal
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        return new CartResponse(
                cart.getToken(),
                itemResponses,
                totalQuantity,
                totalAmount,
                cart.getCreatedAt(),
                cart.getUpdatedAt()
        );
    }

    /*
     * Tính giá sau khuyến mãi cho từng dòng giỏ hàng.
     */
    private CartItemResponse toItemResponse(
            CartItem cartItem
    ) {
        if (cartItem.getProduct() != null) {
            return createProductItemResponse(cartItem);
        }

        if (cartItem.getCombo() != null) {
            return createComboItemResponse(cartItem);
        }

        throw new BadRequestException(
                "Dòng giỏ hàng không có sản phẩm hoặc combo"
        );
    }

    private CartItemResponse createProductItemResponse(
            CartItem cartItem
    ) {
        Product product =
                cartItem.getProduct();

        DiscountPriceResponse discount =
                discountService.calculateForProduct(
                        product
                );

        BigDecimal finalUnitPrice =
                discount.finalPrice();

        BigDecimal lineTotal =
                finalUnitPrice.multiply(
                        BigDecimal.valueOf(
                                cartItem.getQuantity()
                        )
                );

        int availableQuantity =
                Boolean.TRUE.equals(product.getActive())
                        && product.getStockQuantity() != null
                        ? product.getStockQuantity()
                        : 0;

        return new CartItemResponse(
                cartItem.getId(),
                CartItemType.PRODUCT,
                product.getId(),
                product.getName(),
                product.getImageUrl(),
                cartItem.getQuantity(),

                discount.originalPrice(),
                discount.discountAmount(),
                finalUnitPrice,

                lineTotal,
                availableQuantity,
                discount.campaignId(),
                discount.campaignName()
        );
    }

    private CartItemResponse createComboItemResponse(
            CartItem cartItem
    ) {
        Combo combo =
                cartItem.getCombo();

        DiscountPriceResponse discount =
                discountService.calculateForCombo(
                        combo
                );

        BigDecimal finalUnitPrice =
                discount.finalPrice();

        BigDecimal lineTotal =
                finalUnitPrice.multiply(
                        BigDecimal.valueOf(
                                cartItem.getQuantity()
                        )
                );

        int availableQuantity;

        try {
            validateComboCanBePurchased(combo);

            availableQuantity =
                    calculateComboAvailableQuantity(
                            combo
                    );
        } catch (BadRequestException exception) {
            availableQuantity = 0;
        }

        return new CartItemResponse(
                cartItem.getId(),
                CartItemType.COMBO,
                combo.getId(),
                combo.getName(),
                combo.getImageUrl(),
                cartItem.getQuantity(),

                discount.originalPrice(),
                discount.discountAmount(),
                finalUnitPrice,

                lineTotal,
                availableQuantity,
                discount.campaignId(),
                discount.campaignName()
        );
    }
}