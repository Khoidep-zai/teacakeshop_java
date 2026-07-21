package com.example.teacakeshop.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(
                message = "Họ tên không được để trống"
        )
        @Size(
                max = 120,
                message = "Họ tên tối đa 120 ký tự"
        )
        String fullName,

        @NotBlank(
                message = "Email không được để trống"
        )
        @Email(
                message = "Email không đúng định dạng"
        )
        @Size(
                max = 150,
                message = "Email tối đa 150 ký tự"
        )
        String email,

        @Pattern(
                regexp = "^(0[0-9]{9})?$",
                message = "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0"
        )
        String phone,

        @NotBlank(
                message = "Mật khẩu không được để trống"
        )
        @Size(
                min = 8,
                max = 72,
                message = "Mật khẩu phải từ 8 đến 72 ký tự"
        )
        String password
) {
}