package com.example.teacakeshop;

import com.example.teacakeshop.dto.request.LoginRequest;
import com.example.teacakeshop.entity.Combo;
import com.example.teacakeshop.entity.Product;
import com.example.teacakeshop.repository.ComboRepository;
import com.example.teacakeshop.repository.ProductRepository;
import com.example.teacakeshop.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class CatalogSynchronizationIntegrationTest {

    private static final List<String> PRODUCT_NAMES = List.of(
            "Bánh Matcha Mousse Layered 2026",
            "Bánh Earl Grey Chiffon Lavender",
            "Trà Sakura Lychee Rose Ủ Lạnh",
            "Trà Oolong Kim Tuyên Hoàng Gia",
            "Tart Chocolate Truffle Đắng 70%",
            "Trà Jasmine Blossom Ủ Thạch Hữu Cơ"
    );

    private static final List<String> COMBO_NAMES = List.of(
            "Set Trà Chiều Royal Afternoon Tea Pass",
            "Set Thư Thái Đêm Mưa Cyber Chill",
            "Set Năng Lượng Đột Phá Interstellar"
    );

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private AuthService authService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ComboRepository comboRepository;

    private MockMvc mockMvc;
    private String staffAuthorization;
    private String adminAuthorization;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        staffAuthorization = bearer(
                "staff-test@example.com",
                "Test-Staff-Password-Only"
        );
        adminAuthorization = bearer(
                "admin-test@example.com",
                "Test-Admin-Password-Only"
        );
    }

    @Test
    @Transactional
    void seededCatalogHasProductsCombosItemsAndImages() {
        for (String name : PRODUCT_NAMES) {
            Product product = productRepository
                    .findByNameIgnoreCase(name)
                    .orElseThrow();

            assertTrue(Boolean.TRUE.equals(product.getActive()));
            assertTrue(product.getStockQuantity() > 0);
            assertTrue(
                    Files.isRegularFile(
                            Path.of(
                                    "frontend/public"
                                            + product.getImageUrl()
                            )
                    )
            );
        }

        for (String name : COMBO_NAMES) {
            Combo combo = comboRepository
                    .findByNameIgnoreCase(name)
                    .orElseThrow();

            assertTrue(Boolean.TRUE.equals(combo.getActive()));
            assertEquals(2, combo.getItems().size());
            BigDecimal itemTotal = combo.getItems().stream()
                    .map(item -> item.getProduct().getPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            assertEquals(0, itemTotal.compareTo(combo.getOriginalPrice()));
            assertTrue(combo.getComboPrice().compareTo(itemTotal) < 0);
            assertTrue(
                    Files.isRegularFile(
                            Path.of(
                                    "frontend/public"
                                            + combo.getImageUrl()
                            )
                    )
            );
        }
    }

    @Test
    void customerStaffAndAdminReadTheSameCatalog() throws Exception {
        assertCatalogVisible("/api/products", null, PRODUCT_NAMES.getFirst());
        assertCatalogVisible("/api/combos", null, COMBO_NAMES.getFirst());

        assertCatalogVisible(
                "/api/admin/products?size=100",
                staffAuthorization,
                PRODUCT_NAMES.getFirst()
        );
        assertCatalogVisible(
                "/api/admin/combos?size=100",
                staffAuthorization,
                COMBO_NAMES.getFirst()
        );

        assertCatalogVisible(
                "/api/admin/products?size=100",
                adminAuthorization,
                PRODUCT_NAMES.getFirst()
        );
        assertCatalogVisible(
                "/api/admin/combos?size=100",
                adminAuthorization,
                COMBO_NAMES.getFirst()
        );
    }

    @Test
    void staffCatalogAccessRemainsReadOnly() throws Exception {
        mockMvc.perform(
                post("/api/admin/combos")
                        .header("Authorization", staffAuthorization)
                        .contentType("application/json")
                        .content("{}")
        ).andExpect(status().isForbidden());
    }

    private void assertCatalogVisible(
            String endpoint,
            String authorization,
            String expectedName
    ) throws Exception {
        var request = get(endpoint);
        if (authorization != null) {
            request.header("Authorization", authorization);
        }
        mockMvc.perform(request)
                .andExpect(status().isOk())
                .andExpect(content().string(containsString(expectedName)));
    }

    private String bearer(String email, String password) {
        return "Bearer " + authService.login(
                new LoginRequest(email, password)
        ).accessToken();
    }
}
