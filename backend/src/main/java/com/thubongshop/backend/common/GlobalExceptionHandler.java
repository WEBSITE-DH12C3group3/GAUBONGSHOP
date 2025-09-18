package com.thubongshop.backend.common;

import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
    var first = ex.getBindingResult().getFieldErrors().stream().findFirst();
    String msg = first.map(f -> f.getField() + " " + f.getDefaultMessage()).orElse("Invalid input");
    return ResponseEntity.badRequest().body(Map.of("error", msg));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> handleOthers(Exception ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", ex.getMessage()));
  }
}
