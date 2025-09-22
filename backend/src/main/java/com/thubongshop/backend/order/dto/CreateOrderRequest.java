package com.thubongshop.backend.order.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record CreateOrderRequest(
  @NotNull Integer userId,
  @NotBlank String receiverName,
  @NotBlank String phone,
  @NotBlank String addressLine,
  @NotBlank String province,
  String voucherCode,
  @NotNull List<Item> items
) {
  public record Item(
    @NotNull Integer productId,
    @NotBlank String productName,
    @NotNull @DecimalMin("0.0") BigDecimal unitPrice,
    @NotNull @Min(1) Integer quantity,
    @NotNull @DecimalMin("0.0") BigDecimal weightKgPerItem
  ) {}
}
