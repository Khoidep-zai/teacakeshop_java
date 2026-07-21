package com.example.teacakeshop.service;

import com.example.teacakeshop.dto.request.CategoryRequest;
import com.example.teacakeshop.dto.response.CategoryResponse;
import com.example.teacakeshop.entity.Category;
import com.example.teacakeshop.exception.BadRequestException;
import com.example.teacakeshop.exception.ResourceNotFoundException;
import com.example.teacakeshop.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository
                .findByActiveTrueOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        return toResponse(findEntityById(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String normalizedName = request.name().trim();

        if (categoryRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new BadRequestException("Tên danh mục đã tồn tại");
        }

        Category category = new Category();
        category.setName(normalizedName);
        category.setDescription(request.description());
        category.setActive(
                request.active() == null || request.active()
        );

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(
            Long id,
            CategoryRequest request
    ) {
        Category category = findEntityById(id);
        String normalizedName = request.name().trim();

        if (!category.getName().equalsIgnoreCase(normalizedName)
                && categoryRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new BadRequestException("Tên danh mục đã tồn tại");
        }

        category.setName(normalizedName);
        category.setDescription(request.description());

        if (request.active() != null) {
            category.setActive(request.active());
        }

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deactivate(Long id) {
        Category category = findEntityById(id);
        category.setActive(false);
        categoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public Category findEntityById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy danh mục có ID " + id
                        )
                );
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getActive(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}