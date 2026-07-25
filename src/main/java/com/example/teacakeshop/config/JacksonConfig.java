package com.example.teacakeshop.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Đăng ký ObjectMapper (Jackson 2.x) làm Spring Bean.
 *
 * Spring Boot 4.x đi kèm Jackson 3.x (tools.jackson.core) làm default,
 * nhưng một số component nội bộ (security handlers) vẫn cần
 * com.fasterxml.jackson.databind.ObjectMapper (Jackson 2.x).
 * Bean này cung cấp instance Jackson 2.x để autowire đúng type.
 */
@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // Hỗ trợ Java 8 Time API (LocalDateTime, Instant, ...)
        mapper.registerModule(new JavaTimeModule());

        // Không serialize dates dưới dạng timestamp số
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        return mapper;
    }
}
