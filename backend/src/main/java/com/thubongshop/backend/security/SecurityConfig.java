package com.thubongshop.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
            // ❌ Tắt CSRF vì dùng JWT
            .csrf(csrf -> csrf.disable())

            // 🌐 Bật CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 🔒 Stateless session
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ⚡ Phân quyền
            .authorizeHttpRequests(auth -> auth
                // ✅ Cho phép tất cả OPTIONS (fix preflight CORS)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // --- Public API ---
                .requestMatchers(
                        "/api/users/register",
                        "/api/users/login",
                        "/api/products/**",
                        "/api/categories/**",
                        "/api/product-attributes/**",
                        "/api/brands/**",
                        "/api/attributes/**",
                        "/api/imports/**",
                        "/api/import-details/**",
                        "/uploads/**",
                        "/api/coupons/**" // 👉 ADD: public cho apply coupon (không ảnh hưởng /api/admin/**)
                ).permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/brands/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/attributes/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/reviews/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/imports/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/import-details/**").permitAll()

                // Reviews
                .requestMatchers(HttpMethod.GET, "/api/reviews/products/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/reviews/products/**").hasRole("CUSTOMER")

                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // --- Customer API ---
                .requestMatchers("/api/customer/**").hasRole("CUSTOMER")

                // --- Các request khác ---
                .anyRequest().authenticated()
            );

        // ✅ Thêm JwtFilter trước UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 🌐 CORS config
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Cho phép Angular FE gọi API
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD" // 👉 ADD: PATCH, HEAD
        ));
        configuration.setAllowedHeaders(List.of(
                "Authorization", "Content-Type", "Accept",
                "Origin", "X-Requested-With" // 👉 ADD: bổ sung header hay dùng trong preflight
        ));
        configuration.setExposedHeaders(List.of(
                "Authorization", "Content-Type" // 👉 ADD: không bắt buộc, giúp FE đọc header
        ));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // cache preflight 1h

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    // ⚙️ AuthenticationManager
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    // 🔑 PasswordEncoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
