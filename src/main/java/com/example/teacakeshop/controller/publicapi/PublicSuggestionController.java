package com.example.teacakeshop.controller.publicapi;

import com.example.teacakeshop.dto.response.ProductSuggestionResponse;
import com.example.teacakeshop.service.ProductSuggestionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class PublicSuggestionController {

    private final ProductSuggestionService suggestionService;

    public PublicSuggestionController(
            ProductSuggestionService suggestionService
    ) {
        this.suggestionService = suggestionService;
    }

    @GetMapping("/{productId}/suggestions")
    public List<ProductSuggestionResponse> getSuggestions(
            @PathVariable Long productId
    ) {
        return suggestionService
                .getPublicSuggestions(productId);
    }
}