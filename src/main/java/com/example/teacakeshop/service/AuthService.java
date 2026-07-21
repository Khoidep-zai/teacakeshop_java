package com.example.teacakeshop.service;

import com.example.teacakeshop.constant.Role;
import com.example.teacakeshop.dto.request.LoginRequest;
import com.example.teacakeshop.dto.request.RefreshTokenRequest;
import com.example.teacakeshop.dto.request.RegisterRequest;
import com.example.teacakeshop.dto.response.AuthResponse;
import com.example.teacakeshop.dto.response.UserAccountResponse;
import com.example.teacakeshop.entity.UserAccount;
import com.example.teacakeshop.exception.BadRequestException;
import com.example.teacakeshop.exception.ResourceNotFoundException;
import com.example.teacakeshop.exception.UnauthorizedException;
import com.example.teacakeshop.repository.UserAccountRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final RevokedAccessTokenService revokedAccessTokenService;

    public AuthService(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            RevokedAccessTokenService revokedAccessTokenService
    ) {
        this.userAccountRepository =
                userAccountRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.authenticationManager =
                authenticationManager;

        this.jwtService =
                jwtService;

        this.refreshTokenService =
                refreshTokenService;

        this.revokedAccessTokenService =
                revokedAccessTokenService;
    }

    /*
     * Đăng ký tài khoản Customer.
     *
     * Sau khi đăng ký thành công:
     * - tạo Access Token
     * - tạo Refresh Token
     */
    @Transactional
    public AuthResponse register(
            RegisterRequest request
    ) {
        String normalizedEmail =
                normalizeEmail(
                        request.email()
                );

        String normalizedPhone =
                normalizeNullable(
                        request.phone()
                );

        if (userAccountRepository
                .existsByEmailIgnoreCase(
                        normalizedEmail
                )) {

            throw new BadRequestException(
                    "Email đã được sử dụng"
            );
        }

        if (normalizedPhone != null
                && userAccountRepository
                .existsByPhone(
                        normalizedPhone
                )) {

            throw new BadRequestException(
                    "Số điện thoại đã được sử dụng"
            );
        }

        UserAccount account =
                new UserAccount();

        account.setFullName(
                request.fullName().trim()
        );

        account.setEmail(
                normalizedEmail
        );

        account.setPhone(
                normalizedPhone
        );

        account.setPasswordHash(
                passwordEncoder.encode(
                        request.password()
                )
        );

        account.setRole(
                Role.CUSTOMER
        );

        account.setActive(true);

        UserAccount savedAccount =
                userAccountRepository.save(
                        account
                );

        return createAuthResponse(
                savedAccount
        );
    }

    /*
     * Đăng nhập.
     *
     * Không dùng readOnly = true vì method này
     * phải tạo và lưu Refresh Token.
     */
    @Transactional
    public AuthResponse login(
            LoginRequest request
    ) {
        String normalizedEmail =
                normalizeEmail(
                        request.email()
                );

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            normalizedEmail,
                            request.password()
                    )
            );
        } catch (AuthenticationException exception) {
            throw new UnauthorizedException(
                    "Email hoặc mật khẩu không đúng"
            );
        }

        UserAccount account =
                findByEmail(
                        normalizedEmail
                );

        if (!Boolean.TRUE.equals(
                account.getActive()
        )) {
            throw new UnauthorizedException(
                    "Tài khoản đã bị khóa"
            );
        }

        return createAuthResponse(account);
    }

    /*
     * Dùng Refresh Token cũ để tạo:
     * - Access Token mới
     * - Refresh Token mới
     *
     * Refresh Token cũ sẽ bị thu hồi.
     */
    @Transactional
    public AuthResponse refresh(
            RefreshTokenRequest request
    ) {
        RefreshTokenService.RefreshResult result =
                refreshTokenService.rotate(
                        request.refreshToken()
                );

        UserAccount account =
                result.account();

        String accessToken =
                jwtService.generateAccessToken(
                        account
                );

        return new AuthResponse(
                "Bearer",
                accessToken,
                jwtService.getExpirationSeconds(),
                result.refreshToken(),
                result.expiresInSeconds(),
                toResponse(account)
        );
    }

    /*
     * Đăng xuất phiên hiện tại:
     * - thu hồi Refresh Token
     * - thu hồi Access Token hiện tại bằng jti
     */
    @Transactional
    public void logout(
            String refreshToken,
            Jwt jwt
    ) {
        refreshTokenService.revoke(
                refreshToken
        );

        revokedAccessTokenService.revoke(jwt);
    }

    /*
     * Đăng xuất toàn bộ:
     * - thu hồi toàn bộ Refresh Token của tài khoản
     * - thu hồi Access Token hiện tại
     */
    @Transactional
    public void logoutAll(
            Jwt jwt
    ) {
        UserAccount account =
                findByEmail(
                        jwt.getSubject()
                );

        refreshTokenService.revokeAll(
                account.getId()
        );

        revokedAccessTokenService.revoke(jwt);
    }

    /*
     * Xem tài khoản đang đăng nhập.
     */
    @Transactional(readOnly = true)
    public UserAccountResponse getCurrentUser(
            String email
    ) {
        return toResponse(
                findByEmail(email)
        );
    }

    @Transactional(readOnly = true)
    public UserAccount findByEmail(
            String email
    ) {
        return userAccountRepository
                .findByEmailIgnoreCase(
                        normalizeEmail(email)
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy tài khoản"
                        )
                );
    }

    /*
     * Tạo cả Access Token và Refresh Token.
     *
     * Được dùng sau khi:
     * - đăng ký
     * - đăng nhập
     */
    private AuthResponse createAuthResponse(
            UserAccount account
    ) {
        String accessToken =
                jwtService.generateAccessToken(
                        account
                );

        RefreshTokenService.IssuedRefreshToken refreshToken =
                refreshTokenService.issue(
                        account
                );

        return new AuthResponse(
                "Bearer",
                accessToken,
                jwtService.getExpirationSeconds(),
                refreshToken.token(),
                refreshToken.expiresInSeconds(),
                toResponse(account)
        );
    }

    public UserAccountResponse toResponse(
            UserAccount account
    ) {
        return new UserAccountResponse(
                account.getId(),
                account.getFullName(),
                account.getEmail(),
                account.getPhone(),
                account.getRole(),
                account.getActive(),
                account.getCreatedAt(),
                account.getUpdatedAt()
        );
    }

    private String normalizeEmail(
            String email
    ) {
        if (email == null
                || email.isBlank()) {

            throw new BadRequestException(
                    "Email không được để trống"
            );
        }

        return email
                .trim()
                .toLowerCase(
                        Locale.ROOT
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
}