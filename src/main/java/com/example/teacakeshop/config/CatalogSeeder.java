package com.example.teacakeshop.config;

import com.example.teacakeshop.constant.ProductType;
import com.example.teacakeshop.constant.WeatherType;
import com.example.teacakeshop.entity.Category;
import com.example.teacakeshop.entity.Combo;
import com.example.teacakeshop.entity.ComboItem;
import com.example.teacakeshop.entity.Product;
import com.example.teacakeshop.entity.ProductSuggestion;
import com.example.teacakeshop.repository.CategoryRepository;
import com.example.teacakeshop.repository.ComboRepository;
import com.example.teacakeshop.repository.ProductRepository;
import com.example.teacakeshop.repository.ProductSuggestionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
public class CatalogSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ComboRepository comboRepository;
    private final ProductSuggestionRepository suggestionRepository;

    public CatalogSeeder(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            ComboRepository comboRepository,
            ProductSuggestionRepository suggestionRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.comboRepository = comboRepository;
        this.suggestionRepository = suggestionRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Category cakes = category(
                "Bánh ngọt Pháp",
                "Bánh mousse, chiffon và tart thủ công cao cấp từ nguyên liệu Pháp."
        );
        Category teas = category(
                "Trà Ủ Lạnh (Cold Brew)",
                "Trà và thảo mộc hữu cơ ngâm lạnh 12 tiếng, hậu vị thanh nhẹ."
        );

        Product matcha = product(
                cakes,
                "Bánh Matcha Mousse Layered 2026",
                "Bánh mousse trà xanh Matcha Uji Nhật Bản 3 lớp mềm mịn phủ lá vàng 24k nghệ thuật.",
                "75000",
                "/images/products/matcha_cake.png",
                ProductType.CAKE,
                "Ngọt nhẹ, đắng thanh",
                "BOTH",
                "ALL",
                25,
                true,
                true
        );
        Product earlGrey = product(
                cakes,
                "Bánh Earl Grey Chiffon Lavender",
                "Cốt bánh chiffon trà Earl Grey thơm nồng hòa quyện lớp kem tươi lavender và dâu tây Pháp.",
                "82000",
                "/images/products/earl_grey.png",
                ProductType.CAKE,
                "Hương trà thơm ngát",
                "BOTH",
                "ALL",
                18,
                true,
                true
        );
        Product sakura = product(
                teas,
                "Trà Sakura Lychee Rose Ủ Lạnh",
                "Chiết xuất hoa anh đào Nhật Bản kết hợp vải thiều mọng nước và nụ hoa hồng hữu cơ ngâm đá.",
                "68000",
                "/images/products/sakura_tea.png",
                ProductType.TEA,
                "Thanh mát, thơm ngọt",
                "COLD",
                "SUMMER",
                30,
                true,
                true
        );
        Product oolong = product(
                teas,
                "Trà Oolong Kim Tuyên Hoàng Gia",
                "Trà Oolong núi cao hương sữa tự nhiên ủ lạnh 12 tiếng, giữ trọn vị ngọt đượm hậu vị.",
                "65000",
                "/images/products/oolong_tea.png",
                ProductType.TEA,
                "Đượm hậu vị",
                "COLD",
                "ALL",
                28,
                true,
                true
        );
        Product truffle = product(
                cakes,
                "Tart Chocolate Truffle Đắng 70%",
                "Nhân chocolate Bỉ đắng nồng nàn hòa quyện vỏ tart giòn tan từ bơ Pháp cao cấp.",
                "88000",
                "/images/products/truffle_tart.png",
                ProductType.CAKE,
                "Đậm đà nồng nàn",
                "BOTH",
                "ALL",
                15,
                true,
                false
        );
        Product jasmine = product(
                teas,
                "Trà Jasmine Blossom Ủ Thạch Hữu Cơ",
                "Trà nhài đồi cao ngâm hoa nhài tươi kết hợp thạch giòn thanh nhiệt.",
                "62000",
                "/images/products/jasmine_tea.png",
                ProductType.TEA,
                "Thanh nhẹ dịu mát",
                "COLD",
                "SUMMER",
                35,
                false,
                false
        );

        combo(
                "Set Trà Chiều Royal Afternoon Tea Pass",
                "Bộ đôi Trà Oolong Kim Tuyên Hoàng Gia và Bánh Matcha Mousse Layered 2026 lá vàng sang trọng.",
                "/images/combos/royal_tea_set.png",
                "135000",
                "ALL",
                WeatherType.SUNNY,
                matcha,
                oolong
        );
        combo(
                "Set Thư Thái Đêm Mưa Cyber Chill",
                "Trà Sakura Lychee Rose Ủ Lạnh kèm Bánh Earl Grey Chiffon Lavender thơm nồng.",
                "/images/combos/combo_rainy.png",
                "139000",
                "RAINY",
                WeatherType.RAINY,
                sakura,
                earlGrey
        );
        combo(
                "Set Năng Lượng Đột Phá Interstellar",
                "Trà Jasmine Blossom Ủ Thạch Hữu Cơ kết hợp Tart Chocolate Truffle Đắng 70% đậm đà.",
                "/images/combos/combo_energy.png",
                "145000",
                "COLD",
                WeatherType.COLD,
                jasmine,
                truffle
        );

        suggestion(oolong, matcha, "Bộ đôi cân bằng vị trà đượm và mousse matcha.", 0);
        suggestion(matcha, oolong, "Trà Oolong thanh vị rất hợp với mousse matcha.", 0);
        suggestion(sakura, earlGrey, "Hương hoa và vải cân bằng vị Earl Grey lavender.", 0);
        suggestion(earlGrey, sakura, "Trà Sakura mát nhẹ làm dịu vị bánh chiffon.", 0);
        suggestion(jasmine, truffle, "Trà nhài thanh mát cân bằng chocolate đắng 70%.", 0);
        suggestion(truffle, jasmine, "Trà nhài giúp hậu vị chocolate nhẹ và sạch hơn.", 0);
    }

    private Category category(String name, String description) {
        return categoryRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> {
                    Category category = new Category();
                    category.setName(name);
                    category.setDescription(description);
                    category.setActive(true);
                    return categoryRepository.save(category);
                });
    }

    private Product product(
            Category category,
            String name,
            String description,
            String price,
            String imageUrl,
            ProductType type,
            String taste,
            String temperature,
            String season,
            int stock,
            boolean hot,
            boolean bestSeller
    ) {
        return productRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> {
                    Product product = new Product();
                    product.setCategory(category);
                    product.setName(name);
                    product.setDescription(description);
                    product.setPrice(new BigDecimal(price));
                    product.setImageUrl(imageUrl);
                    product.setProductType(type);
                    product.setTaste(taste);
                    product.setTemperatureType(temperature);
                    product.setSeason(season);
                    product.setStockQuantity(stock);
                    product.setSoldQuantity(0);
                    product.setHot(hot);
                    product.setBestSeller(bestSeller);
                    product.setActive(true);
                    return productRepository.save(product);
                });
    }

    private void combo(
            String name,
            String description,
            String imageUrl,
            String comboPrice,
            String season,
            WeatherType weatherType,
            Product first,
            Product second
    ) {
        if (comboRepository.findByNameIgnoreCase(name).isPresent()) {
            return;
        }

        Combo combo = new Combo();
        combo.setName(name);
        combo.setDescription(description);
        combo.setImageUrl(imageUrl);
        combo.setOriginalPrice(
                first.getPrice().add(second.getPrice())
        );
        combo.setComboPrice(new BigDecimal(comboPrice));
        combo.setSeason(season);
        combo.setWeatherType(weatherType);
        combo.setSoldQuantity(0);
        combo.setHot(true);
        combo.setBestSeller(true);
        combo.setActive(true);

        combo.addItem(comboItem(first));
        combo.addItem(comboItem(second));
        comboRepository.save(combo);
    }

    private ComboItem comboItem(Product product) {
        ComboItem item = new ComboItem();
        item.setProduct(product);
        item.setQuantity(1);
        return item;
    }

    private void suggestion(
            Product source,
            Product suggested,
            String reason,
            int priority
    ) {
        if (suggestionRepository
                .existsBySourceProduct_IdAndSuggestedProduct_Id(
                        source.getId(),
                        suggested.getId()
                )) {
            return;
        }

        ProductSuggestion suggestion = new ProductSuggestion();
        suggestion.setSourceProduct(source);
        suggestion.setSuggestedProduct(suggested);
        suggestion.setReason(reason);
        suggestion.setPriority(priority);
        suggestion.setActive(true);
        suggestionRepository.save(suggestion);
    }
}
