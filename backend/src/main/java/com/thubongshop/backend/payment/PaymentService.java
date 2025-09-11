package com.thubongshop.backend.payment;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository repository;

    public Page<Payment> getAll(Integer page, Integer size, String sort) {
        String[] s = (sort == null ? "id,desc" : sort).split(",");
        Pageable pageable = PageRequest.of(
                page == null ? 0 : page,
                size == null ? 10 : size,
                Sort.by(Sort.Direction.fromString(s.length > 1 ? s[1] : "desc"), s[0])
        );
        return repository.findAll(pageable);
    }

    public Payment getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    public Payment create(Payment payment) {
        payment.setId(null); // tránh lỗi Hibernate nhầm insert/update
        return repository.save(payment);
    }

    public Payment update(Long id, Payment paymentDetails) {
        Payment payment = getById(id);

        payment.setOrderId(paymentDetails.getOrderId());
        payment.setPaymentMethod(paymentDetails.getPaymentMethod());
        payment.setAmount(paymentDetails.getAmount());
        payment.setPaymentDate(paymentDetails.getPaymentDate());
        payment.setStatus(paymentDetails.getStatus());

        return repository.save(payment);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Payment not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
