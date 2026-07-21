package com.example.teacakeshop.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary(

            @Value("${cloudinary.cloud-name}")
            String cloudName,

            @Value("${cloudinary.api-key}")
            String apiKey,

            @Value("${cloudinary.api-secret}")
            String apiSecret
    ) {
        if (cloudName == null
                || cloudName.isBlank()
                || "your_cloud_name".equals(cloudName)) {

            throw new IllegalStateException(
                    "Chưa cấu hình cloudinary.cloud-name"
            );
        }

        if (apiKey == null
                || apiKey.isBlank()
                || "your_api_key".equals(apiKey)) {

            throw new IllegalStateException(
                    "Chưa cấu hình cloudinary.api-key"
            );
        }

        if (apiSecret == null
                || apiSecret.isBlank()
                || "your_api_secret".equals(apiSecret)) {

            throw new IllegalStateException(
                    "Chưa cấu hình cloudinary.api-secret"
            );
        }

        return new Cloudinary(
                ObjectUtils.asMap(
                        "cloud_name", cloudName,
                        "api_key", apiKey,
                        "api_secret", apiSecret,
                        "secure", true
                )
        );
    }
}