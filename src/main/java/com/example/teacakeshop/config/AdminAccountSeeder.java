package com.example.teacakeshop.config;

import com.example.teacakeshop.constant.Role;
import com.example.teacakeshop.entity.UserAccount;
import com.example.teacakeshop.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Component
public class AdminAccountSeeder
        implements CommandLineRunner {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    private final String adminFullName;
    private final String adminEmail;
    private final String adminPassword;
    private final String adminPhone;

    public AdminAccountSeeder(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder,

            @Value("${app.admin.full-name}")
            String adminFullName,

            @Value("${app.admin.email}")
            String adminEmail,

            @Value("${app.admin.password}")
            String adminPassword,

            @Value("${app.admin.phone}")
            String adminPhone
    ) {
        this.userAccountRepository =
                userAccountRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.adminFullName =
                adminFullName;

        this.adminEmail =
                adminEmail;

        this.adminPassword =
                adminPassword;

        this.adminPhone =
                adminPhone;
    }

    @Override
    @Transactional
    public void run(String... args) {
        String normalizedEmail =
                adminEmail
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        if (userAccountRepository
                .existsByEmailIgnoreCase(
                        normalizedEmail
                )) {
            return;
        }

        UserAccount admin =
                new UserAccount();

        admin.setFullName(
                adminFullName.trim()
        );

        admin.setEmail(
                normalizedEmail
        );

        admin.setPhone(
                adminPhone.trim()
        );

        admin.setPasswordHash(
                passwordEncoder.encode(
                        adminPassword
                )
        );

        admin.setRole(
                Role.ADMIN
        );

        admin.setActive(true);

        userAccountRepository.save(admin);

    }
}
