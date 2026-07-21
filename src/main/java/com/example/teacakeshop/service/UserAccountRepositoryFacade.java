package com.example.teacakeshop.service;

import com.example.teacakeshop.entity.UserAccount;
import com.example.teacakeshop.exception.ResourceNotFoundException;
import com.example.teacakeshop.repository.UserAccountRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Component
public class UserAccountRepositoryFacade {

    private final UserAccountRepository repository;

    public UserAccountRepositoryFacade(
            UserAccountRepository repository
    ) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public UserAccount findByEmail(
            String email
    ) {
        String normalizedEmail =
                email.trim()
                        .toLowerCase(Locale.ROOT);

        return repository
                .findByEmailIgnoreCase(
                        normalizedEmail
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy tài khoản"
                        )
                );
    }
}