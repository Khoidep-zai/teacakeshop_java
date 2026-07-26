package com.example.teacakeshop.config;

import com.example.teacakeshop.security.RestAccessDeniedHandler;
import com.example.teacakeshop.security.RestAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter authoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        authoritiesConverter.setAuthoritiesClaimName(
                "roles"
        );

        authoritiesConverter.setAuthorityPrefix(
                "ROLE_"
        );

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(
                authoritiesConverter
        );

        return converter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter jwtAuthenticationConverter,
            RestAuthenticationEntryPoint authenticationEntryPoint,
            RestAccessDeniedHandler accessDeniedHandler
    ) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)

                .cors(Customizer.withDefaults())

                .httpBasic(AbstractHttpConfigurer::disable)

                .formLogin(AbstractHttpConfigurer::disable)

                .logout(AbstractHttpConfigurer::disable)

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                /*
                 * PHẦN 276:
                 * Chuẩn hóa JSON cho lỗi 401 và 403.
                 */
                .exceptionHandling(exception ->
                        exception
                                .authenticationEntryPoint(
                                        authenticationEntryPoint
                                )
                                .accessDeniedHandler(
                                        accessDeniedHandler
                                )
                )

                .authorizeHttpRequests(authorize ->
                        authorize

                                /*
                                 * Cho phép CORS preflight.
                                 */
                                .requestMatchers(
                                        HttpMethod.OPTIONS,
                                        "/**"
                                )
                                .permitAll()

                                /*
                                 * API xác thực công khai.
                                 */
                                .requestMatchers(
                                        "/api/auth/register",
                                        "/api/auth/login",
                                        "/api/auth/refresh"
                                )
                                .permitAll()

                                /*
                                 * Cho phép truy cập tài nguyên tĩnh Frontend SPA (index.html, JS, CSS, images).
                                 */
                                .requestMatchers(
                                        "/",
                                        "/index.html",
                                        "/favicon.svg",
                                        "/assets/**",
                                        "/images/**",
                                        "/*.js",
                                        "/*.css",
                                        "/*.ico",
                                        "/*.png",
                                        "/*.svg",
                                        "/products/**",
                                        "/combos/**",
                                        "/reservation/**",
                                        "/cart/**",
                                        "/checkout/**",
                                        "/orders/**",
                                        "/profile/**",
                                        "/login/**",
                                        "/register/**",
                                        "/admin/**"
                                )
                                .permitAll()

                                /*
                                 * Cho phép truy cập Swagger/OpenAPI.
                                 */
                                .requestMatchers(
                                        "/swagger-ui.html",
                                        "/swagger-ui/**",
                                        "/api-docs",
                                        "/api-docs/**",
                                        "/v3/api-docs",
                                        "/v3/api-docs/**"
                                )
                                .permitAll()

                                /*
                                 * API đọc dữ liệu công khai.
                                 */
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/categories/**",
                                        "/api/products/**",
                                        "/api/combos/**",
                                        "/api/discounts/**",
                                        "/api/suggestions/**"
                                )
                                .permitAll()

                                /*
                                 * API dành cho khách vãng lai.
                                 */
                                .requestMatchers(
                                        "/api/carts/**",
                                        "/api/orders/**",
                                        "/api/reservations/**",
                                        "/api/payments/**"
                                )
                                .permitAll()

                                /*
                                 * Chỉ ADMIN được xóa ảnh.
                                 */
                                .requestMatchers(
                                        HttpMethod.DELETE,
                                        "/api/admin/images/**"
                                )
                                .hasRole("ADMIN")

                                /*
                                 * ADMIN và STAFF được upload ảnh.
                                 */
                                .requestMatchers(
                                        "/api/admin/images/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "STAFF"
                                )

                                /*
                                 * Chỉ ADMIN được dùng dashboard,
                                 * quản lý khuyến mãi và tài khoản.
                                 */
                                .requestMatchers(
                                        "/api/admin/dashboard/**",
                                        "/api/admin/discounts/**",
                                        "/api/admin/users/**"
                                )
                                .hasRole("ADMIN")

                                /*
                                 * Các API admin còn lại:
                                 * STAFF và ADMIN.
                                 */
                                .requestMatchers(
                                        "/api/admin/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "STAFF"
                                )

                                /*
                                 * API lịch sử tài khoản cá nhân.
                                 */
                                .requestMatchers(
                                        "/api/customer/**"
                                )
                                .hasAnyRole(
                                        "CUSTOMER",
                                        "STAFF",
                                        "ADMIN"
                                )

                                /*
                                 * Những endpoint còn lại
                                 * bắt buộc phải đăng nhập.
                                 */
                                .anyRequest()
                                .authenticated()
                )

                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        jwtAuthenticationConverter
                                )
                        )
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:3000",
                        "http://localhost:5173"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setExposedHeaders(
                List.of(
                        "Authorization"
                )
        );

        configuration.setAllowCredentials(true);

        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}