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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@EnableMethodSecurity
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtFilter jwtFilter;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
      .csrf(csrf -> csrf.disable())
      .cors(cors -> cors.configurationSource(corsConfigurationSource()))
      .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(auth -> auth
        // 1) Preflight
        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

        // 2) Auth public (đăng nhập/đăng ký/forgot) + error
        .requestMatchers(
          "/api/users/login",
          "/api/users/register",
          "/api/users/forgot-password/**",
          "/error"
        ).permitAll()

        // 3) Static & docs
        .requestMatchers(
          "/uploads/**",
          "/brandimg/**",
          "/v3/api-docs/**",
          "/swagger-ui/**",
          "/swagger-ui.html"
        ).permitAll()

        // 4) Catalog public GET
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

        // 5) Chat: bắt buộc đăng nhập
        .requestMatchers(HttpMethod.POST, "/api/chat/pusher/auth").authenticated()
        .requestMatchers("/api/chat/**").authenticated()

        // 6) Client (v1 & v2) bắt buộc đăng nhập
        .requestMatchers("/api/client/**").authenticated()
        .requestMatchers("/api/v2/client/orders/**").authenticated()

        // 7) Admin (v1 & v2) theo quyền
        .requestMatchers("/api/admin/users/**", "/api/admin/roles/**").hasRole("ADMIN")
        .requestMatchers("/api/admin/products/**").hasAuthority("manage_products")
        .requestMatchers("/api/admin/orders/**").hasAuthority("manage_orders")
        .requestMatchers("/api/admin/imports/**").hasAuthority("manage_imports")
        .requestMatchers("/api/admin/reports/**").hasAuthority("view_reports")
        .requestMatchers("/api/admin/customers/**")
          .hasAnyAuthority("manage_customers", "manage_customer", "ROLE_ADMIN", "ADMIN")
        .requestMatchers("/api/v2/admin/orders/**").hasAuthority("manage_orders")

        // 8) Mặc định: cần đăng nhập
        .anyRequest().authenticated()
      )
      .exceptionHandling(ex -> ex
        .authenticationEntryPoint((req, res, e) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED))
        .accessDeniedHandler((req, res, e) -> res.sendError(HttpServletResponse.SC_FORBIDDEN))
      )
      .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  // 🌐 CORS
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration cfg = new CorsConfiguration();
    // Dev: cho wildcard port (Angular, Vite, v.v.)
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

  // ⚙️ AuthenticationManager
  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
    return configuration.getAuthenticationManager();
  }

  // 🔑 PasswordEncoder
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
