package com.thubongshop.backend.orderv2.support;

import org.springframework.core.annotation.Order;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.OffsetDateTime;
import java.util.*;

/**
 * Handler dành riêng cho layer orderv2 để không đụng global cũ.
 */
@RestControllerAdvice(basePackages = "com.thubongshop.backend.orderv2")
@Order(200) // để global cũ (nếu có @Order nhỏ hơn) ưu tiên trước
public class OrderV2ExceptionHandler {

  public record ApiError(String path, int status, String error, String message,
                         OffsetDateTime timestamp, Map<String, String> fieldErrors) {}

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ApiError> handleAccessDenied(
      AccessDeniedException ex, org.springframework.web.context.request.WebRequest req) {
    return build(req, HttpStatus.FORBIDDEN, "FORBIDDEN", ex.getMessage(), null);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiError> handleValidation(
      MethodArgumentNotValidException ex, org.springframework.web.context.request.WebRequest req) {
    Map<String, String> fields = new LinkedHashMap<>();
    ex.getBindingResult().getFieldErrors()
        .forEach(fe -> fields.put(fe.getField(), fe.getDefaultMessage()));
    return build(req, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu không hợp lệ", fields);
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<ApiError> handleTypeMismatch(
      MethodArgumentTypeMismatchException ex, org.springframework.web.context.request.WebRequest req) {
    return build(req, HttpStatus.BAD_REQUEST, "TYPE_MISMATCH", ex.getMessage(), null);
  }

  @ExceptionHandler(IllegalStateException.class)
  public ResponseEntity<ApiError> handleIllegalState(
      IllegalStateException ex, org.springframework.web.context.request.WebRequest req) {
    return build(req, HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMessage(), null);
  }

  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<ApiError> handleRuntime(
      RuntimeException ex, org.springframework.web.context.request.WebRequest req) {
    return build(req, HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", ex.getMessage(), null);
  }

  private ResponseEntity<ApiError> build(
      org.springframework.web.context.request.WebRequest req,
      HttpStatus status, String error, String message,
      Map<String, String> fieldErrors) {
    String path = Optional.ofNullable(req.getDescription(false))
        .orElse("uri=/").replace("uri=","");
    ApiError body = new ApiError(path, status.value(), error, message, OffsetDateTime.now(), fieldErrors);
    return ResponseEntity.status(status).body(body);
  }
}
