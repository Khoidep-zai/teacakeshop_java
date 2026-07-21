package com.example.teacakeshop.controller.admin;

import com.example.teacakeshop.dto.request.ComboRequest;
import com.example.teacakeshop.dto.response.ComboResponse;
import com.example.teacakeshop.service.ComboService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/combos")
public class AdminComboController {

    private final ComboService comboService;

    public AdminComboController(ComboService comboService) {
        this.comboService = comboService;
    }

    @GetMapping
    public Page<ComboResponse> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return comboService.getAllForAdmin(page, size);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ComboResponse create(
            @Valid @RequestBody ComboRequest request
    ) {
        return comboService.create(request);
    }

    @PutMapping("/{id}")
    public ComboResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ComboRequest request
    ) {
        return comboService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id) {
        comboService.deactivate(id);
    }
}