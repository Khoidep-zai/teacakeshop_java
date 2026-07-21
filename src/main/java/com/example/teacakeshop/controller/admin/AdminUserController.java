package com.example.teacakeshop.controller.admin;

import com.example.teacakeshop.dto.request.UpdateUserActiveRequest;
import com.example.teacakeshop.dto.request.UpdateUserRoleRequest;
import com.example.teacakeshop.dto.response.UserAccountResponse;
import com.example.teacakeshop.service.UserAccountService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserAccountService userAccountService;

    public AdminUserController(
            UserAccountService userAccountService
    ) {
        this.userAccountService =
                userAccountService;
    }

    @GetMapping
    public Page<UserAccountResponse> getAll(
            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size
    ) {
        return userAccountService
                .getAll(page, size);
    }

    @PatchMapping("/{id}/role")
    public UserAccountResponse updateRole(
            @PathVariable Long id,

            @Valid
            @RequestBody
            UpdateUserRoleRequest request
    ) {
        return userAccountService
                .updateRole(
                        id,
                        request.role()
                );
    }

    @PatchMapping("/{id}/active")
    public UserAccountResponse updateActive(
            @PathVariable Long id,

            @Valid
            @RequestBody
            UpdateUserActiveRequest request
    ) {
        return userAccountService
                .updateActive(
                        id,
                        request.active()
                );
    }
}