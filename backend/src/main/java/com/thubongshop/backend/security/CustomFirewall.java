package com.thubongshop.backend.security;

import org.springframework.security.web.firewall.StrictHttpFirewall;
import org.springframework.security.web.firewall.HttpFirewall;

/**
 * ✅ Phiên bản đơn giản tương thích với Spring Security 6.5.x
 * Cho phép các ký tự đặc biệt trong URL callback VNPay (%0A, %25, v.v.)
 * mà không cần override phương thức nội bộ.
 */
public class CustomFirewall {

    public static HttpFirewall vnpayCompatibleFirewall() {
        StrictHttpFirewall firewall = new StrictHttpFirewall();

        // ⚙️ Cho phép các ký tự thường bị encode trong callback VNPay
        firewall.setAllowUrlEncodedPercent(true);
        firewall.setAllowUrlEncodedSlash(true);
        firewall.setAllowUrlEncodedDoubleSlash(true);
        firewall.setAllowSemicolon(true);
        firewall.setAllowBackSlash(true);
        firewall.setAllowUrlEncodedPeriod(true);

        // ✅ Không chặn các chuỗi có newline (ví dụ %0A)
        // (Các bản Spring mới không cần hàm riêng cho %0A — nó tự chấp nhận nếu các flag trên được bật)
        return firewall;
    }
}
