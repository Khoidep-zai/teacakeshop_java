package com.example.teacakeshop.service;

import com.example.teacakeshop.constant.Role;
import com.example.teacakeshop.dto.response.UserAccountResponse;
import com.example.teacakeshop.entity.UserAccount;
import com.example.teacakeshop.exception.BadRequestException;
import com.example.teacakeshop.exception.ResourceNotFoundException;
import com.example.teacakeshop.repository.UserAccountRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserAccountService {

    private final UserAccountRepository userAccountRepository;
    private final AuthService authService;

    public UserAccountService(
            UserAccountRepository userAccountRepository,
            AuthService authService
    ) {
        this.userAccountRepository =
                userAccountRepository;

        this.authService =
                authService;
    }

    @Transactional(readOnly = true)
    public Page<UserAccountResponse> getAll(
            int page,
            int size
    ) {
        int safePage =
                Math.max(page, 0);

        int safeSize =
                Math.min(
                        Math.max(size, 1),
                        100
                );

        Pageable pageable =
                PageRequest.of(
                        safePage,
                        safeSize,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        return userAccountRepository
                .findAll(pageable)
                .map(
                        authService::toResponse
                );
    }

    @Transactional
    public UserAccountResponse updateRole(
            Long id,
            Role role
    ) {
        UserAccount account =
                findEntityById(id);

        if (!Boolean.TRUE.equals(
                account.getActive()
        )) {
            throw new BadRequestException(
                    "Không thể đổi quyền của tài khoản đang bị khóa"
            );
        }

        account.setRole(role);

        return authService.toResponse(
                userAccountRepository.save(
                        account
                )
        );
    }

    @Transactional
    public UserAccountResponse updateActive(
            Long id,
            Boolean active
    ) {
        UserAccount account =
                findEntityById(id);

        account.setActive(active);

        return authService.toResponse(
                userAccountRepository.save(
                        account
                )
        );
    }

    @Transactional(readOnly = true)
    public UserAccount findEntityById(
            Long id
    ) {
        return userAccountRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy tài khoản có ID "
                                        + id
                        )
                );
    }
}