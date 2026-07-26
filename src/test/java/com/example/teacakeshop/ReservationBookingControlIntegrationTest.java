package com.example.teacakeshop;

import com.example.teacakeshop.dto.request.LoginRequest;
import com.example.teacakeshop.service.AuthService;
import com.example.teacakeshop.service.ReservationBookingControlService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class ReservationBookingControlIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private AuthService authService;

    @Autowired
    private ReservationBookingControlService bookingControlService;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;
    private String adminAuthorization;
    private String staffAuthorization;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        adminAuthorization = "Bearer " + authService.login(
                new LoginRequest(
                        "admin-test@example.com",
                        "Test-Admin-Password-Only"
                )
        ).accessToken();

        staffAuthorization = "Bearer " + authService.login(
                new LoginRequest(
                        "staff-test@example.com",
                        "Test-Staff-Password-Only"
                )
        ).accessToken();

        bookingControlService.updateStatus(true);
    }

    @AfterEach
    void restoreBooking() {
        bookingControlService.updateStatus(true);
    }

    @Test
    void adminCanStopAndReopenReservations() throws Exception {
        mockMvc.perform(
                patch("/api/admin/reservations/booking-control")
                        .header("Authorization", adminAuthorization)
                        .contentType("application/json")
                        .content("""
                                {
                                  "acceptingReservations": false
                                }
                                """)
        )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.acceptingReservations")
                                .value(false)
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(containsString(
                                        "hết bàn trong giờ cao điểm"
                                ))
                );

        mockMvc.perform(
                patch("/api/admin/reservations/booking-control")
                        .header("Authorization", adminAuthorization)
                        .contentType("application/json")
                        .content("""
                                {
                                  "acceptingReservations": true
                                }
                                """)
        )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.acceptingReservations")
                                .value(true)
                );
    }

    @Test
    void staffCannotStopReservations() throws Exception {
        mockMvc.perform(
                patch("/api/admin/reservations/booking-control")
                        .header("Authorization", staffAuthorization)
                        .contentType("application/json")
                        .content("""
                                {
                                  "acceptingReservations": false
                                }
                                """)
        ).andExpect(status().isForbidden());

        mockMvc.perform(
                get("/api/admin/reservations/booking-control")
                        .header("Authorization", staffAuthorization)
        )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.acceptingReservations")
                                .value(true)
                );
    }

    @Test
    void customerCannotCreateReservationWhileBookingIsStopped()
            throws Exception {
        bookingControlService.updateStatus(false);

        Map<String, Object> request = new LinkedHashMap<>();
        request.put("customerName", "Khách kiểm thử");
        request.put("customerPhone", "0901234567");
        request.put(
                "customerEmail",
                "booking-control@example.com"
        );
        request.put(
                "reservationTime",
                LocalDateTime.now()
                        .plusDays(2)
                        .withSecond(0)
                        .withNano(0)
        );
        request.put("numberOfPeople", 2);
        request.put("note", "Kiểm tra dừng đặt bàn");

        mockMvc.perform(
                post("/api/reservations")
                        .contentType("application/json")
                        .content(
                                objectMapper.writeValueAsString(
                                        request
                                )
                        )
        )
                .andExpect(status().isBadRequest())
                .andExpect(
                        jsonPath("$.message")
                                .value(containsString(
                                        "vui lòng đặt bàn vào ngày hôm sau"
                                ))
                );
    }
}
