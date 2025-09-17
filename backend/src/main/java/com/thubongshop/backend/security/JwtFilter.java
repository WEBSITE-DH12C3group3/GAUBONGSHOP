package com.thubongshop.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

  private final JwtUtil jwtUtil;
  private final UserDetailsService userDetailsService;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    try {
      String authHeader = request.getHeader("Authorization");
      String token = (authHeader != null && authHeader.startsWith("Bearer ")) ? authHeader.substring(7) : null;

      if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        String username = jwtUtil.extractUsername(token);
        if (username != null) {
          UserDetails userDetails = userDetailsService.loadUserByUsername(username);

          if (jwtUtil.validateToken(token, userDetails)) {
            // userDetails ở đây chính là UserPrincipal vì ta đã sửa UserDetailsServiceImpl
            var authToken = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
          }
        }
      }
    } catch (Exception e) {
      System.out.println("JWT Filter error: " + e.getMessage());
    }
    filterChain.doFilter(request, response);
  }
}
