package com.example.teacakeshop.controller.publicapi;

import com.example.teacakeshop.dto.response.CategoryResponse;
import com.example.teacakeshop.service.CategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class PublicCategoryController {

    private final CategoryService categoryService;

    public PublicCategoryController(
            CategoryService categoryService
    ) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<CategoryResponse> getActiveCategories() {
        return categoryService.getActiveCategories();
    }

    @GetMapping("/{id}")
    public CategoryResponse getById(@PathVariable Long id) {
        return categoryService.getById(id);
    }
}