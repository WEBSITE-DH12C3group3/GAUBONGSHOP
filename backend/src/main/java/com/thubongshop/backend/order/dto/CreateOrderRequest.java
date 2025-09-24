package com.thubongshop.backend.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.util.List;

public record CreateOrderRequest(
    @NotBlank String receiverName,
    @NotBlank String phone,
    @NotBlank String addressLine,
    @NotBlank String province,
    String voucherCode,
    @NotNull List<Item> items
) {
  public record Item(
      @NotNull Integer productId,
      @NotNull @Min(1) Integer quantity,
      @DecimalMin("0.0") BigDecimal weightKgPerItem // có thể null -> service quy về 0
  ) {}
}
