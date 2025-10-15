package com.thubongshop.backend.theme.controller;

import com.thubongshop.backend.theme.ThemeService;
import com.thubongshop.backend.theme.dto.ThemeDtos.ThemeRes;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Theo pattern /api/categories */
@RestController
@RequestMapping("/api/themes")
@RequiredArgsConstructor
public class ThemeController {

  private final ThemeService themeService;

  @GetMapping
  public ResponseEntity<List<ThemeRes>> getAll() {
    return ResponseEntity.ok(themeService.findAllPublic());
  }

  @GetMapping("/{slug}")
  public ResponseEntity<ThemeRes> getBySlug(@PathVariable String slug) {
    return ResponseEntity.ok(themeService.findBySlug(slug));
  }
}
