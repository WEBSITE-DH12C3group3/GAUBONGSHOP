package com.thubongshop.backend.shippingcore;

import com.thubongshop.backend.shippingcore.dto.ShippingQuote;
import com.thubongshop.backend.shippingcore.dto.ShippingQuoteRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/shipping")
@RequiredArgsConstructor
public class PublicShippingController {

  private final ShippingCalculatorService calculator;

  @PostMapping("/quotes")
  public ShippingQuote quotes(@RequestBody ShippingQuoteRequest req) {
    return calculator.quote(req);
  }
}
