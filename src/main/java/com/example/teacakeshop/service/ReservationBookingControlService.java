package com.example.teacakeshop.service;

import com.example.teacakeshop.dto.response.ReservationBookingControlResponse;
import com.example.teacakeshop.entity.ReservationBookingControl;
import com.example.teacakeshop.exception.BadRequestException;
import com.example.teacakeshop.repository.ReservationBookingControlRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservationBookingControlService {

    public static final String FULL_CAPACITY_MESSAGE =
            "Hiện tại nhà hàng đã hết bàn trong giờ cao điểm. "
                    + "Chúng tôi chân thành xin lỗi Quý khách và kính mong "
                    + "Quý khách vui lòng đặt bàn vào ngày hôm sau.";

    private static final String OPEN_MESSAGE =
            "Hệ thống đang nhận đặt bàn bình thường.";

    private static final long CONTROL_ID = 1L;

    private final ReservationBookingControlRepository repository;

    public ReservationBookingControlService(
            ReservationBookingControlRepository repository
    ) {
        this.repository = repository;
    }

    @Transactional
    public ReservationBookingControlResponse getStatus() {
        return toResponse(findOrCreateControl());
    }

    @Transactional
    public ReservationBookingControlResponse updateStatus(
            boolean acceptingReservations
    ) {
        ReservationBookingControl control = findOrCreateControl();
        control.setAcceptingReservations(acceptingReservations);
        control.setMessage(
                acceptingReservations
                        ? OPEN_MESSAGE
                        : FULL_CAPACITY_MESSAGE
        );

        return toResponse(repository.save(control));
    }

    @Transactional
    public void ensureReservationsAreOpen() {
        ReservationBookingControl control = findOrCreateControl();

        if (!Boolean.TRUE.equals(
                control.getAcceptingReservations()
        )) {
            throw new BadRequestException(control.getMessage());
        }
    }

    private ReservationBookingControl findOrCreateControl() {
        return repository.findById(CONTROL_ID)
                .orElseGet(() -> {
                    ReservationBookingControl control =
                            new ReservationBookingControl();
                    control.setId(CONTROL_ID);
                    control.setAcceptingReservations(true);
                    control.setMessage(OPEN_MESSAGE);
                    return repository.save(control);
                });
    }

    private ReservationBookingControlResponse toResponse(
            ReservationBookingControl control
    ) {
        return new ReservationBookingControlResponse(
                Boolean.TRUE.equals(
                        control.getAcceptingReservations()
                ),
                control.getMessage(),
                control.getUpdatedAt()
        );
    }
}
