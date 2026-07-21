package com.example.teacakeshop.config;

import com.example.teacakeshop.service.RevokedAccessTokenService;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class JwtRevocationValidator
        implements OAuth2TokenValidator<Jwt> {

    private final RevokedAccessTokenService revokedTokenService;

    public JwtRevocationValidator(
            RevokedAccessTokenService revokedTokenService
    ) {
        this.revokedTokenService =
                revokedTokenService;
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

        return OAuth2TokenValidatorResult.success();
    }
}