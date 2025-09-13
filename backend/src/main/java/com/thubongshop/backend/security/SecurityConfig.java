package com.thubongshop.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ❌ Tắt CSRF vì dùng JWT (stateless)
            .csrf(csrf -> csrf.disable())

            // 🌐 Bật CORS để cho phép FE Angular truy cập
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 🔒 Không lưu session, mỗi request đều xác thực bằng JWT
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ⚡ Phân quyền
            .authorizeHttpRequests(auth -> auth
                // --- Public API (không cần login) ---
                .requestMatchers(
                        "/api/users/register",
                        "/api/users/login",
                        "/api/products/**",
                        "/api/categories/**"
                ).permitAll()

                // --- Admin API ---
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // --- Customer API ---
                .requestMatchers("/api/customer/**").hasRole("CUSTOMER")

                // --- Các request khác cần đăng nhập ---
                .anyRequest().authenticated()
            );

        // ✅ Thêm JwtFilter trước UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 🌐 Cấu hình CORS cho toàn bộ API
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Cho phép FE Angular (http://localhost:4200) gọi API
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));

        // Các method được phép
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Cho phép tất cả headers
        configuration.setAllowedHeaders(List.of("*"));

        // Cho phép gửi cookie/authorization
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    // ⚙️ AuthenticationManager (xác thực login)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    // 🔑 PasswordEncoder (mã hoá mật khẩu)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
