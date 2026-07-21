package com.example.teacakeshop.dto.request;

import com.example.teacakeshop.constant.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(

        @NotNull(
                message = "Vai trò không được để trống"
        )
        Role role
) {
}