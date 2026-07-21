package com.example.teacakeshop.controller.admin;

import com.example.teacakeshop.dto.request.CategoryRequest;
import com.example.teacakeshop.dto.response.CategoryResponse;
import com.example.teacakeshop.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    private final CategoryService categoryService;

    public AdminCategoryController(
            CategoryService categoryService
    ) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<CategoryResponse> getAll() {
        return categoryService.getAllCategories();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(
            @Valid @RequestBody CategoryRequest request
    ) {
        return categoryService.create(request);
    }

    @PutMapping("/{id}")
    public CategoryResponse update(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        return categoryService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id) {
        categoryService.deactivate(id);
    }
}