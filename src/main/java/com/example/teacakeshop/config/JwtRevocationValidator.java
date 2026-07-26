package com.example.teacakeshop.config;

import com.example.teacakeshop.service.RevokedAccessTokenService;
import com.example.teacakeshop.repository.UserAccountRepository;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class JwtRevocationValidator
        implements OAuth2TokenValidator<Jwt> {

    private final RevokedAccessTokenService revokedTokenService;
    private final UserAccountRepository userAccountRepository;

    public JwtRevocationValidator(
            RevokedAccessTokenService revokedTokenService,
            UserAccountRepository userAccountRepository
    ) {
        this.revokedTokenService =
                revokedTokenService;
        this.userAccountRepository =
                userAccountRepository;
    }

    @Override
    public OAuth2TokenValidatorResult validate(
            Jwt jwt
    ) {
        String jti = jwt.getId();

        if (jti == null || jti.isBlank()) {
            OAuth2Error error =
                    new OAuth2Error(
                            "invalid_token",
                            "Access Token không có jti",
                            null
                    );

            return OAuth2TokenValidatorResult
                    .failure(error);
        }

        if (revokedTokenService
                .isRevoked(jti)) {

            OAuth2Error error =
                    new OAuth2Error(
                            "invalid_token",
                            "Access Token đã bị thu hồi",
                            null
                    );

            return OAuth2TokenValidatorResult
                    .failure(error);
        }

        String subject = jwt.getSubject();

        boolean activeAccount =
                subject != null
                        && userAccountRepository
                        .findByEmailIgnoreCase(subject)
                        .map(account -> {
                            java.util.List<String> tokenRoles =
                                    jwt.getClaimAsStringList(
                                            "roles"
                                    );

                            return Boolean.TRUE.equals(
                                    account.getActive()
                            )
                                    && tokenRoles != null
                                    && tokenRoles.contains(
                                    account.getRole().name()
                            );
                        })
                        .orElse(false);

        if (!activeAccount) {
            OAuth2Error error =
                    new OAuth2Error(
                            "invalid_token",
                            "Tài khoản đã bị khóa hoặc quyền truy cập đã thay đổi",
                            null
                    );

            return OAuth2TokenValidatorResult
                    .failure(error);
        }

        return OAuth2TokenValidatorResult.success();
    }
}
