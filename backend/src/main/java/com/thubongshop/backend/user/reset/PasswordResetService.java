package com.thubongshop.backend.user.reset;

import com.thubongshop.backend.common.EmailService;
import com.thubongshop.backend.user.User;
import com.thubongshop.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetCodeRepository codeRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final Environment env;

    /** thời hạn OTP (phút) */
    @Value("${app.passwordReset.ttlMinutes:5}")
    private int ttlMinutes;

    /** cho phép fail email trong môi trường dev (vẫn trả OK để test) */
    @Value("${app.passwordReset.devAllowMailFail:true}")
    private boolean devAllowMailFail;

    private static final SecureRandom RNG = new SecureRandom();

    /** Sinh mã 6 số 000000..999999 */
    private String generateCode() {
        return String.format("%06d", RNG.nextInt(1_000_000));
    }

    private boolean isDev() {
        for (String p : env.getActiveProfiles()) {
            if ("dev".equalsIgnoreCase(p)) return true;
        }
        return false;
    }

    // ========================================================================
    // BƯỚC 1: tạo mã và gửi email
    // - Bao toàn bộ trong @Transactional để xóa/insert chạy cùng transaction
    // - Nếu gửi mail lỗi: DEV có thể cho qua, PROD ném lỗi có kiểm soát
    // ========================================================================
    @Transactional
    public void createAndSendCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại"));

        // Dọn mã cũ đã hết hạn (nếu có)
        codeRepository.deleteByEmailAndExpiresAtBefore(email, LocalDateTime.now());

        // Tạo mã mới
        String code = generateCode();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(ttlMinutes);

        PasswordResetCode prc = new PasswordResetCode();
        prc.setEmail(user.getEmail());
        prc.setCode(code);
        prc.setCreatedAt(now);
        prc.setExpiresAt(expiresAt);
        prc.setUsed(false);
        codeRepository.save(prc);

        // Gửi mail (bọc try/catch để không làm vỡ API khi cấu hình SMTP chưa sẵn)
        String subject = "[GAUBONGSHOP] Mã xác thực quên mật khẩu";
        String content = """
                Xin chào %s,

                Mã xác thực của bạn là: %s
                Mã có hiệu lực trong %d phút kể từ bây giờ.

                Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.

                Trân trọng.
                """.formatted(user.getUsername(), code, ttlMinutes);

        try {
            emailService.sendPlainText(user.getEmail(), subject, content);
        } catch (Exception ex) {
            log.error("Gửi email mã OTP thất bại tới {}: {}", email, ex.getMessage(), ex);
            // Ở môi trường dev, cho qua để FE test (OTP có trong log)
            if (devAllowMailFail && isDev()) {
                log.warn("DEV mode: bỏ qua lỗi gửi email. OTP cho {} = {}", email, code);
            } else {
                throw new RuntimeException("Không gửi được email xác thực. Vui lòng thử lại sau.");
            }
        }
    }

    // ========================================================================
    // BƯỚC 2: Xác thực mã (không đổi mật khẩu)
    // ========================================================================
    @Transactional(readOnly = true)
    public void verifyCode(String email, String code) {
        PasswordResetCode prc = codeRepository
                .findTopByEmailAndCodeAndUsedIsFalseOrderByIdDesc(email, code)
                .orElseThrow(() -> new IllegalArgumentException("Mã không hợp lệ"));

        if (prc.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Mã đã hết hạn");
        }
        // hợp lệ -> không làm gì thêm (FE sẽ chuyển sang bước đổi mật khẩu)
    }

    // ========================================================================
    // BƯỚC 3: Đổi mật khẩu khi mã hợp lệ
    // - Gói trong @Transactional: update user + đánh dấu used chạy atomically
    // ========================================================================
    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        PasswordResetCode prc = codeRepository
                .findTopByEmailAndCodeAndUsedIsFalseOrderByIdDesc(email, code)
                .orElseThrow(() -> new IllegalArgumentException("Mã không hợp lệ"));

        if (prc.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Mã đã hết hạn");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        prc.setUsed(true);
        codeRepository.save(prc);

        // Tuỳ chọn: dọn các mã khác đã hết hạn của người dùng cho sạch DB
        codeRepository.deleteByEmailAndExpiresAtBefore(email, LocalDateTime.now());
    }
}
