package com.example.teacakeshop;

import com.example.teacakeshop.constant.ReservationStatus;
import com.example.teacakeshop.dto.request.LoginRequest;
import com.example.teacakeshop.entity.Reservation;
import com.example.teacakeshop.repository.ReservationRepository;
import com.example.teacakeshop.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class StaffAuthorizationIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private AuthService authService;

    @Autowired
    private ReservationRepository reservationRepository;

    private MockMvc mockMvc;
    private String staffAuthorization;
    private String adminAuthorization;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        String accessToken = authService.login(
                new LoginRequest(
                        "staff-test@example.com",
                        "Test-Staff-Password-Only"
                )
        ).accessToken();

        staffAuthorization = "Bearer " + accessToken;

        adminAuthorization = "Bearer " + authService.login(
                new LoginRequest(
                        "admin-test@example.com",
                        "Test-Admin-Password-Only"
                )
        ).accessToken();
    }

    @Test
    void staffCanReadOperationalResources() throws Exception {
        mockMvc.perform(
                get("/api/admin/orders")
                        .header(
                                "Authorization",
                                staffAuthorization
                        )
        ).andExpect(status().isOk());

        mockMvc.perform(
                get("/api/admin/payments")
                        .header(
                                "Authorization",
                                staffAuthorization
                        )
        ).andExpect(status().isOk());

        mockMvc.perform(
                get("/api/admin/products")
                        .header(
                                "Authorization",
                                staffAuthorization
                        )
        ).andExpect(status().isOk());

        mockMvc.perform(
                patch("/api/staff/inventory/products/999999")
                        .header(
                                "Authorization",
                                staffAuthorization
                        )
                        .contentType("application/json")
                        .content("""
                                {
                                  "stockQuantity": 10,
                                  "note": "Kiểm kê cuối ca"
                                }
                                """)
        ).andExpect(status().isNotFound());
    }

    @Test
    void staffCannotUseAdminOnlyResourcesOrWriteProducts()
            throws Exception {
        mockMvc.perform(
                get("/api/admin/users")
                        .header(
                                "Authorization",
                                staffAuthorization
                        )
        ).andExpect(status().isForbidden());

        mockMvc.perform(
                post("/api/admin/products")
                        .header(
                                "Authorization",
                                staffAuthorization
                        )
                        .contentType("application/json")
                        .content("{}")
        ).andExpect(status().isForbidden());

        mockMvc.perform(
                patch("/api/admin/payments/1/mark-paid")
                        .header(
                                "Authorization",
                                staffAuthorization
                        )
        ).andExpect(status().isForbidden());
    }

    @Test
    void staffAndAdminCanUpdateActiveReservationStatus()
            throws Exception {
        Reservation staffReservation = createPendingReservation();
        mockMvc.perform(
                patch(
                        "/api/admin/reservations/{id}/status",
                        staffReservation.getId()
                )
                        .header(
                                "Authorization",
                                staffAuthorization
                        )
                        .contentType("application/json")
                        .content("""
                                {
                                  "status": "CONFIRMED"
                                }
                                """)
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        Reservation adminReservation = createPendingReservation();
        mockMvc.perform(
                patch(
                        "/api/admin/reservations/{id}/status",
                        adminReservation.getId()
                )
                        .header(
                                "Authorization",
                                adminAuthorization
                        )
                        .contentType("application/json")
                        .content("""
                                {
                                  "status": "CONFIRMED"
                                }
                                """)
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    private Reservation createPendingReservation() {
        Reservation reservation = new Reservation();
        reservation.setReservationCode(
                "RSV-TEST-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
        );
        reservation.setCustomerName("Khách kiểm thử");
        reservation.setCustomerPhone("0900000000");
        reservation.setCustomerEmail("reservation-test@example.com");
        reservation.setReservationTime(
                LocalDateTime.now().plusDays(2)
        );
        reservation.setNumberOfPeople(2);
        reservation.setStatus(ReservationStatus.PENDING);
        return reservationRepository.save(reservation);
    }
}
