package com.example.teacakeshop.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaWebController {

    @GetMapping(value = {
        "/",
        "/products/**",
        "/combos/**",
        "/reservation/**",
        "/reservations/**",
        "/cart/**",
        "/checkout/**",
        "/orders/**",
        "/profile/**",
        "/login/**",
        "/register/**",
        "/admin/**"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
