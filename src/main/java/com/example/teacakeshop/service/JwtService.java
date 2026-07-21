package com.example.teacakeshop.service;

import com.example.teacakeshop.entity.UserAccount;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final String issuer;
    private final long expirationSeconds;

    public JwtService(
            JwtEncoder jwtEncoder,

            @Value("${app.jwt.issuer}")
            String issuer,

            @Value("${app.jwt.expiration-seconds}")
            long expirationSeconds
    ) {
        this.jwtEncoder = jwtEncoder;
        this.issuer = issuer;
        this.expirationSeconds =
                expirationSeconds;
    }

    public String generateAccessToken(
            UserAccount account
    ) {
        Instant issuedAt =
                Instant.now();

        Instant expiresAt =
                issuedAt.plusSeconds(
                        expirationSeconds
                );

        JwtClaimsSet claims =
                JwtClaimsSet.builder()
                        .issuer(issuer)
                        .issuedAt(issuedAt)
                        .expiresAt(expiresAt)

                        /*
                         * JWT ID dùng để thu hồi Access Token.
                         */
                        .id(
                                UUID.randomUUID()
                                        .toString()
                        )

                        .subject(
                                account.getEmail()
                        )

                        .claim(
                                "userId",
                                account.getId()
                        )

                        .claim(
                                "fullName",
                                account.getFullName()
                        )

                        .claim(
                                "roles",
                                List.of(
                                        account.getRole()
                                                .name()
                                )
                        )

                        .build();

        JwsHeader header =
                JwsHeader
                        .with(MacAlgorithm.HS256)
                        .type("JWT")
                        .build();

        JwtEncoderParameters parameters =
                JwtEncoderParameters.from(
                        header,
                        claims
                );

        return jwtEncoder
                .encode(parameters)
                .getTokenValue();
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }
}