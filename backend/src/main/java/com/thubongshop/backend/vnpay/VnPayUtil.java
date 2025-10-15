package com.thubongshop.backend.vnpay;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class VnPayUtil {

    // 🔐 Hàm tạo chữ ký HMAC SHA512
    public static String hmacSHA512(String key, String data) {
        try {
            if (key == null || data == null) return null;
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] hash = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error while hashing", e);
        }
    }

    // 🧮 Build chuỗi dữ liệu theo chuẩn VNPay 2.1.0
public static Map<String, String> build(Map<String, String> fields) {
    List<String> fieldNames = new ArrayList<>(fields.keySet());
    Collections.sort(fieldNames);

    StringBuilder hashData = new StringBuilder();
    StringBuilder query = new StringBuilder();

    for (int i = 0; i < fieldNames.size(); i++) {
        String name = fieldNames.get(i);
        String value = fields.get(name);

        if (value != null && !value.isEmpty()) {
            // ✅ Encode UTF-8 cho cả hashData và query để đồng nhất với VNPay
            String encodedName = URLEncoder.encode(name, StandardCharsets.UTF_8);
            String encodedValue = URLEncoder.encode(value, StandardCharsets.UTF_8);

            hashData.append(encodedName).append('=').append(encodedValue);
            query.append(encodedName).append('=').append(encodedValue);

            if (i != fieldNames.size() - 1) {
                hashData.append('&');
                query.append('&');
            }
        }
    }

    Map<String, String> result = new HashMap<>();
    result.put("hashData", hashData.toString());
    result.put("query", query.toString());
    return result;
}

}
