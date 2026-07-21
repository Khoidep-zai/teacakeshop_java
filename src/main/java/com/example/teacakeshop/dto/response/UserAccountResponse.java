package com.example.teacakeshop.dto.response;

import com.example.teacakeshop.constant.Role;

import java.time.LocalDateTime;

public record UserAccountResponse(

        Long id,

        String fullName,

        String email,

        String phone,

        Role role,

        Boolean active,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}