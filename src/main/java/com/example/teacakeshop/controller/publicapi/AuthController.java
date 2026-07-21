package com.example.teacakeshop.controller.publicapi;

import com.example.teacakeshop.dto.request.LoginRequest;
import com.example.teacakeshop.dto.request.RefreshTokenRequest;
import com.example.teacakeshop.dto.request.RegisterRequest;
import com.example.teacakeshop.dto.response.AuthResponse;
import com.example.teacakeshop.dto.response.MessageResponse;
import com.example.teacakeshop.dto.response.UserAccountResponse;
import com.example.teacakeshop.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(
            AuthService authService
    ) {
        this.authService = authService;
    }

    /*
     * Đăng ký tài khoản Customer.
     *
     * Không cần Access Token.
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(
            @Valid
            @RequestBody
            RegisterRequest request
    ) {
        return authService.register(request);
    }

    /*
     * Đăng nhập.
     *
     * Trả về:
     * - Access Token
     * - Refresh Token
     */
    @PostMapping("/login")
    public AuthResponse login(
            @Valid
            @RequestBody
            LoginRequest request
    ) {
        return authService.login(request);
    }

    /*
     * Dùng Refresh Token để tạo:
     * - Access Token mới
     * - Refresh Token mới
     *
     * Không cần Access Token.
     */
    @PostMapping("/refresh")
    public AuthResponse refresh(
            @Valid
            @RequestBody
            RefreshTokenRequest request
    ) {
        return authService.refresh(request);
    }

    /*
     * Xem tài khoản hiện đang đăng nhập.
     *
     * Bắt buộc có Access Token.
     */
    @GetMapping("/me")
    public UserAccountResponse getCurrentUser(
            @AuthenticationPrincipal
            Jwt jwt
    ) {
        return authService.getCurrentUser(
                jwt.getSubject()
        );
    }

    /*
     * Đăng xuất phiên hiện tại.
     *
     * Bắt buộc:
     * - Access Token trong Authorization
     * - Refresh Token trong body
     */
    @PostMapping("/logout")
    public MessageResponse logout(
            @Valid
            @RequestBody
            RefreshTokenRequest request,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        authService.logout(
                request.refreshToken(),
                jwt
        );

        return new MessageResponse(
                "Đăng xuất thành công"
        );
    }

    /*
     * Thu hồi toàn bộ Refresh Token
     * của tài khoản hiện tại.
     *
     * Bắt buộc có Access Token.
     */
    @PostMapping("/logout-all")
    public MessageResponse logoutAll(
            @AuthenticationPrincipal
            Jwt jwt
    ) {
        authService.logoutAll(jwt);

        return new MessageResponse(
                "Đã đăng xuất khỏi tất cả phiên làm việc"
        );
    }
}