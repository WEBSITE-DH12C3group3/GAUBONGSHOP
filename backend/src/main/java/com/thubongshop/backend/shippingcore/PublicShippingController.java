package com.thubongshop.backend.shippingcore;

import com.thubongshop.backend.shippingcore.dto.ShippingQuote;
import com.thubongshop.backend.shippingcore.dto.ShippingQuoteRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public/shipping")
public class PublicShippingController {

  private final ShippingCalculatorService calc;

  @PostMapping("/quotes")
  public ResponseEntity<List<ShippingQuote>> quotes(@Valid @RequestBody ShippingQuoteRequest req) {
    // Hiện tại chỉ có 1 rate active → trả về 1 phần tử để dễ mở rộng sau
    return ResponseEntity.ok(List.of(calc.quote(req)));
  }

  @PostMapping("/quotes/preview-voucher")
  public ResponseEntity<ShippingQuote> previewVoucher(@Valid @RequestBody ShippingQuoteRequest req) {
    return ResponseEntity.ok(calc.quote(req));
  }
}