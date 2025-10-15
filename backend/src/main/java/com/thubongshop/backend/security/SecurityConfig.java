package com.thubongshop.backend.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@EnableMethodSecurity
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtFilter jwtFilter;

  /* ✅ Firewall tuỳ chỉnh cho phép callback VNPay chứa ký tự %0A */
@Bean
public HttpFirewall allowUrlEncodedFirewall() {
    return CustomFirewall.vnpayCompatibleFirewall();
}


  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
      .csrf(csrf -> csrf.disable())
      .cors(cors -> cors.configurationSource(corsConfigurationSource()))
      .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(auth -> auth
        // 1️⃣ Preflight
        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

        // 2️⃣ Cho phép callback từ VNPay
        .requestMatchers("/api/payment/vnpay/**").permitAll()

        // 3️⃣ Auth public
        .requestMatchers(
          "/api/users/login",
          "/api/users/register",
          "/api/users/forgot-password/**",
          "/error"
        ).permitAll()

        // 4️⃣ Static & Swagger
        .requestMatchers(
          "/uploads/**",
          "/brandimg/**",
          "/v3/api-docs/**",
          "/swagger-ui/**",
          "/swagger-ui.html"
        ).permitAll()

        // 5️⃣ Catalog public GET
        .requestMatchers(HttpMethod.GET,
          "/api/products/**",
          "/api/categories/**",
          "/api/brands/**",
          "/api/attributes/**",
          "/api/reviews/products/**",
          "/api/imports/**",
          "/api/import-details/**",
          "/api/favorites/**"
        ).permitAll()

        // 6️⃣ Chat
        .requestMatchers(HttpMethod.POST, "/api/chat/pusher/auth").authenticated()
        .requestMatchers("/api/chat/**").authenticated()

        // 7️⃣ Client
        .requestMatchers("/api/client/**").authenticated()
        .requestMatchers("/api/v2/client/orders/**").authenticated()

        // 8️⃣ Admin
        .requestMatchers("/api/admin/users/**", "/api/admin/roles/**").hasRole("ADMIN")
        .requestMatchers("/api/admin/stats/**").hasAnyAuthority("view_reports")
        .requestMatchers("/api/admin/products/**").hasAuthority("manage_products")
        .requestMatchers("/api/admin/orders/**").hasAuthority("manage_orders")
        .requestMatchers("/api/admin/imports/**").hasAuthority("manage_imports")
        .requestMatchers("/api/admin/reports/**").hasAuthority("view_reports")
        .requestMatchers("/api/admin/customers/**")
          .hasAnyAuthority("manage_customers", "manage_customer", "ROLE_ADMIN", "ADMIN")
        .requestMatchers("/api/v2/admin/orders/**").hasAuthority("manage_orders")
        .requestMatchers("/api/admin/themes/**").hasAuthority("manage_themes")

        // 9️⃣ Mặc định yêu cầu đăng nhập
        .anyRequest().authenticated()
      )
      .exceptionHandling(ex -> ex
        .authenticationEntryPoint((req, res, e) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED))
        .accessDeniedHandler((req, res, e) -> res.sendError(HttpServletResponse.SC_FORBIDDEN))
      )
      .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  /* 🌐 CORS Config */
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration cfg = new CorsConfiguration();
    cfg.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
    cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS","HEAD"));
    cfg.setAllowedHeaders(List.of("Authorization","Content-Type","Accept","Origin","X-Requested-With"));
    cfg.setExposedHeaders(List.of("Authorization","Content-Type"));
    cfg.setAllowCredentials(true);
    cfg.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", cfg);
    return source;
  }

  /* ⚙️ AuthenticationManager */
  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
    return configuration.getAuthenticationManager();
  }

  /* 🔑 PasswordEncoder */
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
