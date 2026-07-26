package com.example.teacakeshop;

import com.example.teacakeshop.constant.Role;
import com.example.teacakeshop.dto.request.RegisterRequest;
import com.example.teacakeshop.dto.response.AuthResponse;
import com.example.teacakeshop.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@Transactional
class AuthRegistrationIntegrationTest {

    @Autowired
    private AuthService authService;

    @Test
    void registerCreatesCustomerAndReturnsBothTokens() {
        RegisterRequest request = new RegisterRequest(
                "Khoa Tran",
                "khoa-" + UUID.randomUUID() + "@example.com",
                "0373517116",
                "password123"
        );

        AuthResponse response = authService.register(request);

        assertNotNull(response.user().id());
        assertEquals(Role.CUSTOMER, response.user().role());
        assertFalse(response.accessToken().isBlank());
        assertFalse(response.refreshToken().isBlank());
    }
}
