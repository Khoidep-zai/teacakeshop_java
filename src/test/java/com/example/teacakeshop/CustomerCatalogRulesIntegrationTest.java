package com.example.teacakeshop;

import com.example.teacakeshop.constant.CartItemType;
import com.example.teacakeshop.constant.ProductType;
import com.example.teacakeshop.constant.WeatherType;
import com.example.teacakeshop.dto.request.AddCartItemRequest;
import com.example.teacakeshop.entity.Category;
import com.example.teacakeshop.entity.Combo;
import com.example.teacakeshop.entity.Product;
import com.example.teacakeshop.exception.BadRequestException;
import com.example.teacakeshop.repository.CategoryRepository;
import com.example.teacakeshop.repository.ComboRepository;
import com.example.teacakeshop.repository.ProductRepository;
import com.example.teacakeshop.service.CartService;
import com.example.teacakeshop.service.ComboService;
import com.example.teacakeshop.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
class CustomerCatalogRulesIntegrationTest {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ComboRepository comboRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private ComboService comboService;

    @Autowired
    private CartService cartService;

    @Test
    void customerProductSearchUsesServerFilters() {
        Category category = createCategory(true);
        Product inStock = createProduct(category, 5);
        createProduct(category, 0);

        var result = productService.search(
                null,
                ProductType.TEA,
                category.getId(),
                true,
                null,
                "newest",
                0,
                20
        );

        assertEquals(1, result.getTotalElements());
        assertEquals(inStock.getId(), result.getContent().getFirst().id());
    }

    @Test
    void expiredComboIsNotReturnedToCustomer() {
        Combo combo = new Combo();
        combo.setName("Expired-" + UUID.randomUUID());
        combo.setOriginalPrice(new BigDecimal("100000"));
        combo.setComboPrice(new BigDecimal("80000"));
        combo.setWeatherType(WeatherType.NORMAL);
        combo.setActive(true);
        combo.setStartDate(LocalDate.now().minusDays(10));
        combo.setEndDate(LocalDate.now().minusDays(1));
        comboRepository.save(combo);

        var result = comboService.search(
                combo.getName(),
                0,
                10
        );

        assertEquals(0, result.getTotalElements());
    }

    @Test
    void cartRejectsProductWhoseCategoryIsInactive() {
        Category inactiveCategory = createCategory(false);
        Product product = createProduct(inactiveCategory, 10);
        String token = cartService.createCart().token();

        assertThrows(
                BadRequestException.class,
                () -> cartService.addItem(
                        token,
                        new AddCartItemRequest(
                                CartItemType.PRODUCT,
                                product.getId(),
                                1
                        )
                )
        );
    }

    private Category createCategory(boolean active) {
        Category category = new Category();
        category.setName(
                "Category-" + UUID.randomUUID()
        );
        category.setDescription("Customer catalog test");
        category.setActive(active);
        return categoryRepository.save(category);
    }

    private Product createProduct(
            Category category,
            int stock
    ) {
        Product product = new Product();
        product.setCategory(category);
        product.setName(
                "Product-" + UUID.randomUUID()
        );
        product.setDescription("Customer catalog test");
        product.setPrice(new BigDecimal("50000"));
        product.setProductType(ProductType.TEA);
        product.setStockQuantity(stock);
        product.setActive(true);
        return productRepository.save(product);
    }
}
