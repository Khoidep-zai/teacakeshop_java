package com.example.teacakeshop;

import com.example.teacakeshop.constant.*;
import com.example.teacakeshop.dto.request.ComboRequest;
import com.example.teacakeshop.dto.request.PaymentRequest;
import com.example.teacakeshop.entity.CustomerOrder;
import com.example.teacakeshop.entity.Product;
import com.example.teacakeshop.exception.BadRequestException;
import com.example.teacakeshop.exception.ResourceNotFoundException;
import com.example.teacakeshop.repository.ComboRepository;
import com.example.teacakeshop.repository.CustomerOrderRepository;
import com.example.teacakeshop.repository.PaymentRepository;
import com.example.teacakeshop.repository.ProductRepository;
import com.example.teacakeshop.service.*;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ServiceRulesTest {

    @Test
    void publicProductDetailRejectsInactiveProduct() {
        ProductRepository repository = mock(ProductRepository.class);
        Product product = new Product();
        product.setId(10L);
        product.setActive(false);
        when(repository.findById(10L)).thenReturn(Optional.of(product));

        ProductService service = new ProductService(
                repository,
                mock(CategoryService.class),
                mock(DiscountService.class)
        );

        assertThrows(ResourceNotFoundException.class, () -> service.getById(10L));
    }

    @Test
    void comboEndDateMustBeAfterStartDate() {
        ComboService service = new ComboService(
                mock(ComboRepository.class),
                mock(ProductService.class),
                mock(DiscountService.class)
        );
        LocalDate date = LocalDate.of(2026, 7, 27);
        ComboRequest request = new ComboRequest(
                "Combo test", null, null, BigDecimal.valueOf(100),
                null, WeatherType.NORMAL, date, date,
                false, false, true, List.of()
        );

        assertThrows(BadRequestException.class, () -> service.create(request));
    }

    @Test
    void anonymousPaymentRequiresMatchingOrderPhone() {
        OrderService orderService = mock(OrderService.class);
        CustomerOrder order = new CustomerOrder();
        order.setId(5L);
        order.setCustomerPhone("0901234567");
        when(orderService.findEntityById(5L)).thenReturn(order);

        PaymentService service = new PaymentService(
                mock(PaymentRepository.class),
                mock(CustomerOrderRepository.class),
                orderService
        );
        PaymentRequest request = new PaymentRequest(
                5L, "0999999999", PaymentMethod.MOMO_SIMULATION,
                PaymentPurpose.FULL, null
        );

        assertThrows(ResourceNotFoundException.class,
                () -> service.simulateOnlinePayment(request));
    }
}
