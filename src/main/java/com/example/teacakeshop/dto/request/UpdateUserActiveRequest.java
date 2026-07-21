package com.example.teacakeshop.dto.request;

import jakarta.validation.constraints.NotNull;

public record UpdateUserActiveRequest(

        @NotNull(
                message = "Trạng thái không được để trống"
        )
        Boolean active
) {
}