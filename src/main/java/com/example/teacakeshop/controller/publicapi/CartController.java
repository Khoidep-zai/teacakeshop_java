package com.example.teacakeshop.controller.publicapi;

import com.example.teacakeshop.dto.request.AddCartItemRequest;
import com.example.teacakeshop.dto.request.UpdateCartItemRequest;
import com.example.teacakeshop.dto.response.CartResponse;
import com.example.teacakeshop.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /*
     * Tạo giỏ mới.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CartResponse createCart() {
        return cartService.createCart();
    }

    /*
     * Xem giỏ.
     */
    @GetMapping("/{token}")
    public CartResponse getCart(
            @PathVariable String token
    ) {
        return cartService.getCart(token);
    }

    /*
     * Thêm sản phẩm hoặc combo.
     */
    @PostMapping("/{token}/items")
    public CartResponse addItem(
            @PathVariable String token,
            @Valid @RequestBody AddCartItemRequest request
    ) {
        return cartService.addItem(token, request);
    }

    /*
     * Cập nhật số lượng.
     */
    @PutMapping("/{token}/items/{cartItemId}")
    public CartResponse updateItemQuantity(
            @PathVariable String token,
            @PathVariable Long cartItemId,
            @Valid @RequestBody
            UpdateCartItemRequest request
    ) {
        return cartService.updateItemQuantity(
                token,
                cartItemId,
                request
        );
    }

    /*
     * Xóa một món.
     */
    @DeleteMapping("/{token}/items/{cartItemId}")
    public CartResponse removeItem(
            @PathVariable String token,
            @PathVariable Long cartItemId
    ) {
        return cartService.removeItem(
                token,
                cartItemId
        );
    }

    /*
     * Xóa toàn bộ giỏ.
     */
    @DeleteMapping("/{token}/items")
    public CartResponse clearCart(
            @PathVariable String token
    ) {
        return cartService.clearCart(token);
    }
}