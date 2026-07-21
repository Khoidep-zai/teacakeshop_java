package com.example.teacakeshop.controller.admin;

import com.example.teacakeshop.dto.request.ProductSuggestionRequest;
import com.example.teacakeshop.dto.response.ProductSuggestionResponse;
import com.example.teacakeshop.service.ProductSuggestionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/suggestions")
public class AdminSuggestionController {

    private final ProductSuggestionService suggestionService;

    public AdminSuggestionController(
            ProductSuggestionService suggestionService
    ) {
        this.suggestionService = suggestionService;
    }

    @GetMapping
    public Page<ProductSuggestionResponse> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return suggestionService.getAllForAdmin(
                page,
                size
        );
    }

    @GetMapping("/{id}")
    public ProductSuggestionResponse getById(
            @PathVariable Long id
    ) {
        return suggestionService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductSuggestionResponse create(
            @Valid
            @RequestBody
            ProductSuggestionRequest request
    ) {
        return suggestionService.create(request);
    }

    @PutMapping("/{id}")
    public ProductSuggestionResponse update(
            @PathVariable Long id,
            @Valid
            @RequestBody
            ProductSuggestionRequest request
    ) {
        return suggestionService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id) {
        suggestionService.deactivate(id);
    }
}