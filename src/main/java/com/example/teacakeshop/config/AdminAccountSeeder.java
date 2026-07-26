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
    private final String staffFullName;
    private final String staffEmail;
    private final String staffPassword;
    private final String staffPhone;

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
            String adminPhone,

            @Value("${app.staff.full-name}")
            String staffFullName,

            @Value("${app.staff.email}")
            String staffEmail,

            @Value("${app.staff.password}")
            String staffPassword,

            @Value("${app.staff.phone}")
            String staffPhone
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

        this.staffFullName =
                staffFullName;

        this.staffEmail =
                staffEmail;

        this.staffPassword =
                staffPassword;

        this.staffPhone =
                staffPhone;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedAccount(
                adminFullName,
                adminEmail,
                adminPassword,
                adminPhone,
                Role.ADMIN
        );

        seedAccount(
                staffFullName,
                staffEmail,
                staffPassword,
                staffPhone,
                Role.STAFF
        );
    }

    private void seedAccount(
            String fullName,
            String email,
            String password,
            String phone,
            Role role
    ) {
        String normalizedEmail =
                email
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        UserAccount account =
                userAccountRepository
                        .findByEmailIgnoreCase(normalizedEmail)
                        .orElseGet(UserAccount::new);

        account.setFullName(
                fullName.trim()
        );

        account.setEmail(
                normalizedEmail
        );

        account.setPhone(
                phone.trim()
        );

        account.setPasswordHash(
                passwordEncoder.encode(
                        password
                )
        );

        account.setRole(
                role
        );

        account.setActive(true);

        userAccountRepository.save(account);
    }
}
