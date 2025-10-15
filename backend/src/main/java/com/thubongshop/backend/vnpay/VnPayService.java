package com.thubongshop.backend.vnpay;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VnPayService {

    private final VnPayConfig config;

    // 🧾 Hàm tạo URL thanh toán VNPay
    public String createPaymentUrl(String orderId, long amount, String ipAddr) {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", config.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amount * 100)); // VNPay yêu cầu nhân 100
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", orderId);
        params.put("vnp_OrderType", "other");
        params.put("vnp_OrderInfo", ("Thanh toan don hang " + orderId).trim());
        params.put("vnp_ReturnUrl", config.getReturnUrl().trim());
        params.put("vnp_Locale", "vn");
        params.put("vnp_IpAddr", ipAddr);
        params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

        // ❌ KHÔNG thêm vnp_SecureHashType vào tham số hash
        // params.put("vnp_SecureHashType", "HmacSHA512"); ← loại bỏ

        // 🔐 Sinh hashData và query string (có encode đúng chuẩn)
        var built = VnPayUtil.build(params);

        // ✅ Sinh chữ ký HMAC SHA512 theo chuẩn VNPay
        String secureHash = VnPayUtil.hmacSHA512(config.getHashSecret(), built.get("hashData"));

        // ✅ Debug log để kiểm tra
        System.out.println("=== VNPay Config ===");
        System.out.println("tmnCode = " + config.getTmnCode());
        System.out.println("hashSecret = " + config.getHashSecret());
        System.out.println("payUrl = " + config.getPayUrl());
        System.out.println("returnUrl = " + config.getReturnUrl());
        System.out.println("====================");
        System.out.println(">>> HASH DATA RAW = " + built.get("hashData"));
        System.out.println(">>> SECURE HASH = " + secureHash);

        // ✅ Tạo URL cuối cùng: chỉ thêm SecureHashType sau khi hash xong
        String paymentUrl = config.getPayUrl() + "?" + built.get("query")
                + "&vnp_SecureHash=" + secureHash;

        System.out.println(">>> URL = " + paymentUrl);

        // ✅ Trả về URL thanh toán hoàn chỉnh
        return paymentUrl;
    }

    // 🧩 Xác thực callback từ VNPay
    public boolean verify(Map<String, String> params) {
        String receivedHash = params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        var built = VnPayUtil.build(params);
        String calculatedHash = VnPayUtil.hmacSHA512(config.getHashSecret(), built.get("hashData"));

        return calculatedHash.equalsIgnoreCase(receivedHash);
    }
}
