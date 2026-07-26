package com.example.teacakeshop.repository;

import com.example.teacakeshop.entity.ReservationBookingControl;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationBookingControlRepository
        extends JpaRepository<ReservationBookingControl, Long> {
}
