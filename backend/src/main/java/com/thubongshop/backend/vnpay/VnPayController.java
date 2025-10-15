package com.thubongshop.backend.vnpay;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment/vnpay")
public class VnPayController {

    private final VnPayService vnPayService;

    public VnPayController(VnPayService vnPayService) {
        this.vnPayService = vnPayService;
    }

    // 🧾 Tạo URL thanh toán VNPay
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> create(@RequestBody Map<String, Object> req,
                                                      HttpServletRequest request) {
        String orderId = (String) req.getOrDefault("orderId", req.get("orderCode"));
        Object amountObj = req.getOrDefault("amount", req.get("totalAmount"));
        long amount = Long.parseLong(amountObj.toString());

        // Chuẩn hóa IP (nếu là IPv6 loopback thì đổi về IPv4)
        String ipAddr = request.getRemoteAddr();
        if ("0:0:0:0:0:0:0:1".equals(ipAddr)) {
            ipAddr = "127.0.0.1";
        }

        System.out.println(">>> DEBUG: orderId=" + orderId + ", amount=" + amount + ", ip=" + ipAddr);

        String url = vnPayService.createPaymentUrl(orderId, amount, ipAddr);
        return ResponseEntity.ok(Map.of("paymentUrl", url));
    }

    // 🔍 Xác minh callback từ VNPay
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        Map<String, String> params = (Map<String, String>) body.get("params");
        boolean valid = vnPayService.verify(params);
        String code = params.get("vnp_ResponseCode");

        return ResponseEntity.ok(Map.of(
                "valid", valid,
                "responseCode", code));
    }

    // 🔁 Xử lý return URL (VNPay redirect về sau thanh toán)
    @GetMapping("/return")
    public void handleReturn(@RequestParam Map<String, String> params, HttpServletResponse response)
            throws IOException {
        boolean valid = vnPayService.verify(params);
        String responseCode = params.get("vnp_ResponseCode");

        String redirectUrl;

        if (valid && "00".equals(responseCode)) {
            // ✅ Thanh toán thành công
            String orderId = params.get("vnp_TxnRef");
            String amount = params.get("vnp_Amount");

            // ⚙️ Encode toàn bộ message và query để tránh Unicode error
            String message = URLEncoder.encode("Thanh toán thành công", StandardCharsets.UTF_8);
            String encodedOrderId = URLEncoder.encode(orderId, StandardCharsets.UTF_8);
            String encodedAmount = URLEncoder.encode(amount, StandardCharsets.UTF_8);

            redirectUrl = "http://localhost:4200/checkout/order-success-page"
                    + "?status=success"
                    + "&message=" + message
                    + "&orderId=" + encodedOrderId
                    + "&amount=" + encodedAmount;
        } else {
            // ❌ Thanh toán thất bại
            String message = URLEncoder.encode("Thanh toán thất bại hoặc sai chữ ký", StandardCharsets.UTF_8);

            redirectUrl = "http://localhost:4200/checkout/order-failed-page"
                    + "?status=failed"
                    + "&message=" + message;
        }

        System.out.println(">>> Redirecting to: " + redirectUrl);
        response.sendRedirect(redirectUrl); // 🚀 chuyển hướng thật sự về frontend
    }

}
