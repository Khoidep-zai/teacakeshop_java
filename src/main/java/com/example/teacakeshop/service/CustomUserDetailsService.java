package com.example.teacakeshop.service;

import com.example.teacakeshop.entity.UserAccount;
import com.example.teacakeshop.repository.UserAccountRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService
        implements UserDetailsService {

    private final UserAccountRepository userAccountRepository;

    public CustomUserDetailsService(
            UserAccountRepository userAccountRepository
    ) {
        this.userAccountRepository =
                userAccountRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(
            String email
    ) throws UsernameNotFoundException {

        UserAccount account =
                userAccountRepository
                        .findByEmailIgnoreCase(
                                email.trim()
                        )
                        .orElseThrow(() ->
                                new UsernameNotFoundException(
                                        "Không tìm thấy tài khoản"
                                )
                        );

        return User
                .withUsername(account.getEmail())
                .password(account.getPasswordHash())
                .roles(account.getRole().name())
                .disabled(
                        !Boolean.TRUE.equals(
                                account.getActive()
                        )
                )
                .build();
    }
}