package com.example.teacakeshop.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME =
            "bearerAuth";

    @Bean
    public OpenAPI teaCakeShopOpenAPI() {

        SecurityScheme securityScheme =
                new SecurityScheme()
                        .name(SECURITY_SCHEME_NAME)
                        .type(
                                SecurityScheme.Type.HTTP
                        )
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description(
                                "Nhập Access Token JWT. "
                                        + "Không cần nhập chữ Bearer."
                        );

        SecurityRequirement securityRequirement =
                new SecurityRequirement()
                        .addList(
                                SECURITY_SCHEME_NAME
                        );

        Contact contact =
                new Contact()
                        .name("Tea & Cake Shop Team")
                        .email("admin@teacakeshop.local");

        Info info =
                new Info()
                        .title(
                                "Tea & Cake Shop API"
                        )
                        .description(
                                """
                                REST API cho hệ thống website trà bánh.

                                Các chức năng chính:
                                - Đăng ký, đăng nhập và JWT
                                - Quản lý sản phẩm và danh mục
                                - Combo và khuyến mãi
                                - Giỏ hàng và checkout
                                - Đơn hàng và thanh toán
                                - Đặt bàn
                                - Dashboard quản trị
                                - Upload ảnh Cloudinary
                                """
                        )
                        .version("1.0.0")
                        .contact(contact)
                        .license(
                                new License()
                                        .name(
                                                "Educational Project"
                                        )
                        );

        return new OpenAPI()
                .info(info)
                .addSecurityItem(
                        securityRequirement
                )
                .components(
                        new Components()
                                .addSecuritySchemes(
                                        SECURITY_SCHEME_NAME,
                                        securityScheme
                                )
                );
    }
}