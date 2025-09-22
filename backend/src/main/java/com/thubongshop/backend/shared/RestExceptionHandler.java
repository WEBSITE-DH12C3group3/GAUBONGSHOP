package com.thubongshop.backend.shared;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestControllerAdvice
public class RestExceptionHandler {
  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<?> handleBiz(BusinessException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
      .body(Map.of("error", ex.getCode(), "message", ex.getMessage()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> handleOther(Exception ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
      .body(Map.of("error", "INTERNAL_ERROR", "message", ex.getMessage()));
  }
}
