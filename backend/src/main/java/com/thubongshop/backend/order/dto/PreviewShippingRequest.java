package com.thubongshop.backend.order.dto;

import java.math.BigDecimal;

public class PreviewShippingRequest {
  public BigDecimal orderSubtotal;
  public BigDecimal weightKg;
  public Double destLat;
  public Double destLng;
  public String province;

  // ✅ Thêm field mã vận chuyển để FE gửi lên
  public String voucherCode;

  // optional – nếu bạn có nhiều hãng/dịch vụ
  public String carrierCode;
  public String serviceCode;
}
