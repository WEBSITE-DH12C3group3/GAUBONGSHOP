package com.thubongshop.backend.vnpay;

import com.thubongshop.backend.order.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/payment/vnpay")
@RequiredArgsConstructor
public class VnPayController {

    private final VnPayService vnPayService;
    private final OrderService orderService; // ✅ Thêm OrderService để cập nhật trạng thái thanh toán

    // 🧾 Tạo URL thanh toán VNPay
@PostMapping("/create")
public ResponseEntity<Map<String, String>> create(@RequestBody Map<String, Object> req,
                                                  HttpServletRequest request) {

    System.out.println("\n==================== VNPay Create Payment DEBUG ====================");
    System.out.println("📦 Raw request body: " + req);
    System.out.println("===================================================================");

    // 🧩 1️⃣ Lấy dữ liệu an toàn từ body
    String receiverName = (String) req.getOrDefault("receiverName", "");
    String phone = (String) req.getOrDefault("phone", "");
    String addressLine = (String) req.getOrDefault("addressLine", "");
    String province = (String) req.getOrDefault("province", "");
    String orderCode = req.get("orderCode") != null ? req.get("orderCode").toString() : null; // ✅ nhận orderCode thật

    double itemsTotal = 0.0;
    double shippingFee = 0.0;
    double grandTotal = 0.0;

    try {
        itemsTotal = req.get("itemsTotal") != null
                ? Double.parseDouble(req.get("itemsTotal").toString())
                : 0.0;

        shippingFee = req.get("shippingFee") != null
                ? Double.parseDouble(req.get("shippingFee").toString())
                : 0.0;

        grandTotal = req.get("grandTotal") != null
                ? Double.parseDouble(req.get("grandTotal").toString())
                : (itemsTotal + shippingFee);
    } catch (Exception e) {
        System.err.println("⚠️ Lỗi khi parse dữ liệu tiền: " + e.getMessage());
    }

    System.out.println("💰 Parsed Values:");
    System.out.println("   ├─ receiverName = " + receiverName);
    System.out.println("   ├─ phone        = " + phone);
    System.out.println("   ├─ addressLine  = " + addressLine);
    System.out.println("   ├─ province     = " + province);
    System.out.println("   ├─ orderCode    = " + orderCode);
    System.out.println("   ├─ itemsTotal   = " + itemsTotal);
    System.out.println("   ├─ shippingFee  = " + shippingFee);
    System.out.println("   └─ grandTotal   = " + grandTotal);

    // ✅ 2️⃣ Đảm bảo số tiền tối thiểu hợp lệ theo VNPay (>= 5000)
    if (grandTotal < 5000) {
        System.err.println("⚠️ VNPay yêu cầu số tiền tối thiểu 5,000đ → Tự động chỉnh grandTotal = 5000");
        grandTotal = 5000;
    }

    // 🧾 3️⃣ Tạo hoặc dùng lại đơn hàng PENDING_PAYMENT
    System.out.println("🧾 Đang tạo/lấy đơn hàng PENDING_PAYMENT trong DB...");
    var order = orderService.createPendingOrder(
            receiverName,
            phone,
            addressLine,
            province,
            itemsTotal,
            shippingFee,
            grandTotal,
            orderCode   // ✅ truyền orderCode thật để không tạo đơn trống mới
    );
    System.out.println("✅ Đã dùng/đã tạo orderCode = " + order.getOrderCode());

    // 🌐 4️⃣ Lấy IP thực (fix IPv6 localhost)
    String ipAddr = request.getRemoteAddr();
    if ("0:0:0:0:0:0:0:1".equals(ipAddr)) ipAddr = "127.0.0.1";
    System.out.println("🌍 Client IP = " + ipAddr);

    // 🧮 5️⃣ Làm tròn số tiền trước khi gửi VNPay
    long amount = Math.round(grandTotal);
    System.out.println("💳 Số tiền làm tròn gửi VNPay = " + amount + " (VND)");

    // 💠 6️⃣ Tạo URL thanh toán VNPay
    System.out.println("🔗 Đang tạo URL thanh toán VNPay...");
    String url = vnPayService.createPaymentUrl(order.getOrderCode(), amount, ipAddr);
    System.out.println("✅ URL thanh toán VNPay: " + url);

    // 📤 7️⃣ Trả về cho frontend
    System.out.println("==================== VNPay Create Payment DONE ====================\n");
    return ResponseEntity.ok(Map.of(
            "paymentUrl", url,
            "orderCode", order.getOrderCode(),
            "amount", String.valueOf(amount)
    ));
}




    // 🔍 Xác minh callback từ VNPay (tuỳ chọn test riêng)
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
        String orderId = params.get("vnp_TxnRef");

        // ✅ Làm sạch chuỗi trước khi sử dụng
        if (orderId != null) {
            orderId = orderId
                    .trim()
                    .replaceAll("[\\r\\n]", "") // xóa xuống dòng
                    .replaceAll("%0A", "") // xóa dạng mã hóa URL
                    .replaceAll("%0D", ""); // xóa carriage return nếu có
        }
        System.out.println("🧩 Cleaned orderId = [" + orderId + "]");

        String amount = params.get("vnp_Amount");

        String redirectUrl;

        if (valid && "00".equals(responseCode)) {
            // ✅ Thanh toán thành công — cập nhật trạng thái đơn hàng
            try {
                orderService.markPaidByCode(orderId);
                System.out.println("✅ Đơn hàng " + orderId + " đã được cập nhật trạng thái PAID.");
            } catch (Exception e) {
                System.err.println("⚠️ Lỗi khi cập nhật trạng thái đơn hàng: " + e.getMessage());
            }

            // Encode toàn bộ message và query để tránh lỗi Unicode
            String message = URLEncoder.encode("Thanh toán thành công", StandardCharsets.UTF_8);
            String encodedOrderId = URLEncoder.encode(orderId, StandardCharsets.UTF_8);
            String encodedAmount = URLEncoder.encode(amount, StandardCharsets.UTF_8);

            redirectUrl = "http://localhost:4200/checkout/order-success-page"
                    + "?status=success"
                    + "&message=" + message
                    + "&orderId=" + encodedOrderId
                    + "&amount=" + encodedAmount;
        } else {
            // ❌ Thanh toán thất bại hoặc sai chữ ký
            String message = URLEncoder.encode("Thanh toán thất bại hoặc sai chữ ký", StandardCharsets.UTF_8);
            redirectUrl = "http://localhost:4200/checkout/order-failed-page"
                    + "?status=failed"
                    + "&message=" + message;
        }

        System.out.println(">>> Redirecting to: " + redirectUrl);
        response.sendRedirect(redirectUrl); // 🚀 Chuyển hướng thật sự về frontend
    }
}
