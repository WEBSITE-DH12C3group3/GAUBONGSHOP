package com.thubongshop.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

  private final JwtUtil jwtUtil;
  private final UserDetailsService userDetailsService;

  // Các path bỏ qua xác thực JWT (đã permitAll ở SecurityConfig)
  private static final Set<String> SKIP_PREFIXES = Set.of(
      "/uploads/", "/brandimg/", "/v3/api-docs/", "/swagger-ui/"
  );
  private static final Set<String> SKIP_EXACTS = Set.of(
      "/error", "/api/users/login", "/api/users/register"
  );

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain
  ) throws ServletException, IOException {

    try {
      // 0) Bỏ qua OPTIONS cho gọn (CORS preflight)
      if (HttpMethod.OPTIONS.matches(request.getMethod())) {
        filterChain.doFilter(request, response);
        return;
      }

      final String uri = request.getRequestURI();

      // 1) Bỏ qua các endpoint public để tránh xử lý JWT không cần thiết
      if (shouldSkip(uri)) {
        filterChain.doFilter(request, response);
        return;
      }

      // 2) Lấy token từ header Authorization: Bearer xxx (không phân biệt hoa/thường)
      String authHeader = request.getHeader("Authorization");
      String token = null;
      if (authHeader != null) {
        String trimmed = authHeader.trim();
        if (trimmed.regionMatches(true, 0, "Bearer ", 0, 7)) { // case-insensitive
          token = trimmed.substring(7);
        }
      }

      // 3) Nếu chưa có Authentication trong context và có token → kiểm tra
      if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {

        String username = jwtUtil.extractUsername(token);  // có thể ném exception nếu token hỏng
        if (username != null && !username.isBlank()) {
          UserDetails userDetails = userDetailsService.loadUserByUsername(username);

          if (jwtUtil.validateToken(token, userDetails)) {
            // OK → gắn Authentication vào context
            UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
          } else {
            // Token không hợp lệ hoặc hết hạn → bảo đảm context sạch
            SecurityContextHolder.clearContext();
          }
        }
      }

    } catch (Exception e) {
      // Không chặn request, chỉ đảm bảo context sạch để EntryPoint trả 401 đúng chuẩn
      SecurityContextHolder.clearContext();
      // (Bạn có thể đổi sang logger thay vì println)
      System.out.println("[JWT] filter error: " + e.getClass().getSimpleName() + " - " + e.getMessage());
    }

    // 4) Tiếp tục chain
    filterChain.doFilter(request, response);
  }

  private boolean shouldSkip(String uri) {
    if (uri == null) return false;
    // exact
    if (SKIP_EXACTS.contains(uri)) return true;
    // prefix
    for (String p : SKIP_PREFIXES) {
      if (uri.startsWith(p)) return true;
    }
    // public catalog GET đã permitAll, nhưng vẫn để filter xử lý cho các call có bearer (không sao)
    return false;
  }
}
