package com.thubongshop.backend.shippingvoucher.controller;

import com.thubongshop.backend.shippingvoucher.ApplyShipVoucherRequest;
import com.thubongshop.backend.shippingvoucher.ShipVoucherService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipping-vouchers")
@CrossOrigin(origins = "*")
public class ShipVoucherController {

    private final ShipVoucherService service;

    public ShipVoucherController(ShipVoucherService service) {
        this.service = service;
    }

    // POST /api/shipping-vouchers/apply
    @PostMapping("/apply")
    public ResponseEntity<?> apply(@Valid @RequestBody ApplyShipVoucherRequest req) {
        return ResponseEntity.ok(service.apply(req));
    }
}
