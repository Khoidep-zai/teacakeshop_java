package com.example.teacakeshop.controller.publicapi;

import com.example.teacakeshop.constant.ProductType;
import com.example.teacakeshop.dto.response.ProductResponse;
import com.example.teacakeshop.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class PublicProductController {

    private final ProductService productService;

    public PublicProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public Page<ProductResponse> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ProductType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        return productService.search(keyword, type, page, size);
    }

    @GetMapping("/{id}")
    public ProductResponse getById(@PathVariable Long id) {
        return productService.getById(id);
    }

    @GetMapping("/hot")
    public List<ProductResponse> getHotProducts() {
        return productService.getHotProducts();
    }

    @GetMapping("/best-sellers")
    public List<ProductResponse> getBestSellers() {
        return productService.getBestSellers();
    }

    @GetMapping("/newest")
    public List<ProductResponse> getNewestProducts() {
        return productService.getNewestProducts();
    }
}