package com.example.teacakeshop.controller.publicapi;

import com.example.teacakeshop.constant.WeatherType;
import com.example.teacakeshop.dto.response.ComboResponse;
import com.example.teacakeshop.dto.response.ProductSuggestionResponse;
import com.example.teacakeshop.service.ComboService;
import com.example.teacakeshop.service.ProductSuggestionService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/combos")
public class PublicComboController {

    private final ComboService comboService;
    private final ProductSuggestionService suggestionService;

    public PublicComboController(
            ComboService comboService,
            ProductSuggestionService suggestionService
    ) {
        this.comboService = comboService;
        this.suggestionService = suggestionService;
    }

    @GetMapping
    public Page<ComboResponse> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        return comboService.search(keyword, page, size);
    }

    @GetMapping("/hot")
    public List<ComboResponse> getHotCombos() {
        return comboService.getHotCombos();
    }

    @GetMapping("/best-sellers")
    public List<ComboResponse> getBestSellers() {
        return comboService.getBestSellers();
    }

    @GetMapping("/newest")
    public List<ComboResponse> getNewestCombos() {
        return comboService.getNewestCombos();
    }

    @GetMapping("/weather/{weatherType}")
    public List<ComboResponse> getByWeather(
            @PathVariable WeatherType weatherType
    ) {
        return comboService.getByWeather(weatherType);
    }

    @GetMapping("/{id}")
    public ComboResponse getById(@PathVariable Long id) {
        return comboService.getById(id);
    }

    /**
     * Lấy danh sách sản phẩm gợi ý dựa trên
     * các sản phẩm thành phần của combo.
     * Không cần Access Token.
     */
    @GetMapping("/{id}/suggestions")
    public List<ProductSuggestionResponse> getSuggestions(
            @PathVariable Long id
    ) {
        return suggestionService.getPublicSuggestionsForCombo(id);
    }
}