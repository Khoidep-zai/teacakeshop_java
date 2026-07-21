package com.example.teacakeshop.controller.publicapi;

import com.example.teacakeshop.constant.WeatherType;
import com.example.teacakeshop.dto.response.ComboResponse;
import com.example.teacakeshop.service.ComboService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/combos")
public class PublicComboController {

    private final ComboService comboService;

    public PublicComboController(ComboService comboService) {
        this.comboService = comboService;
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
}