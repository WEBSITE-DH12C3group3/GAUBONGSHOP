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
                        "/uploads/**"
                ).permitAll()


// <<<<<<< HEAD
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/brands/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/attributes/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/reviews/products/**").permitAll()

                // Reviews
                .requestMatchers(HttpMethod.GET, "/api/reviews/products/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/reviews/products/**").hasRole("CUSTOMER")


                // --- Admin API ---
// =======
//                 // --- Cho phép GET categories trong admin công khai ---
//                 .requestMatchers(HttpMethod.GET, "/api/admin/categories", "/api/admin/categories/**").permitAll()

//                 // --- Chỉ ADMIN mới được CRUD categories ---
//                 .requestMatchers(HttpMethod.POST, "/api/admin/categories/**").hasRole("ADMIN")
//                 .requestMatchers(HttpMethod.PUT, "/api/admin/categories/**").hasRole("ADMIN")
//                 .requestMatchers(HttpMethod.DELETE, "/api/admin/categories/**").hasRole("ADMIN")

//                 // --- Các API admin khác: chỉ ADMIN ---
// >>>>>>> 3ae76a28004dc97b4d247e1cafc42a7ea3428870

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
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
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
