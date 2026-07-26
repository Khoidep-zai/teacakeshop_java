package com.example.teacakeshop;

import com.example.teacakeshop.dto.request.LoginRequest;
import com.example.teacakeshop.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class StaffAuthorizationIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private AuthService authService;

    private MockMvc mockMvc;
    private String staffAuthorization;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        String accessToken = authService.login(
                new LoginRequest(
                        "staff-test@example.com",
                        "Test-Staff-Password-Only"
                )
        ).accessToken();

        staffAuthorization = "Bearer " + accessToken;
    }

    @Test
    void staffCanReadOperationalResources() throws Exception {
        mockMvc.perform(
                get("/api/admin/orders")
                        .header(
                                "Authorization",
                                staffAuthorization
                        )
        ).andExpect(status().isOk());

        mockMvc.perform(
                get("/api/admin/payments")
                        .header(
                                "Authorization",
                                staffAuthorization
                        )
        ).andExpect(status().isOk());

        mockMvc.perform(
                get("/api/admin/products")
                        .header(
                                "Authorization",
                                staffAuthorization
                        )
        ).andExpect(status().isOk());

        mockMvc.perform(
                patch("/api/staff/inventory/products/999999")
                        .header(
                                "Authorization",
                                staffAuthorization
                        )
                        .contentType("application/json")
                        .content("""
                                {
                                  "stockQuantity": 10,
                                  "note": "Kiểm kê cuối ca"
                                }
                                """)
        ).andExpect(status().isNotFound());
    }

    @Test
    void staffCannotUseAdminOnlyResourcesOrWriteProducts()
            throws Exception {
        mockMvc.perform(
                get("/api/admin/users")
                        .header(
                                "Authorization",
                                staffAuthorization
                        )
        ).andExpect(status().isForbidden());

        mockMvc.perform(
                post("/api/admin/products")
                        .header(
                                "Authorization",
                                staffAuthorization
                        )
                        .contentType("application/json")
                        .content("{}")
        ).andExpect(status().isForbidden());

        mockMvc.perform(
                patch("/api/admin/payments/1/mark-paid")
                        .header(
                                "Authorization",
                                staffAuthorization
                        )
        ).andExpect(status().isForbidden());
    }
}
