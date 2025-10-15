package com.thubongshop.backend.theme.controller;

import com.thubongshop.backend.theme.ThemeService;
import com.thubongshop.backend.theme.dto.ThemeDtos.ThemeReq;
import com.thubongshop.backend.theme.dto.ThemeDtos.ThemeRes;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Theo pattern /api/admin/categories */
@RestController
@RequestMapping("/api/admin/themes")
@RequiredArgsConstructor
public class AdminThemeController {

  private final ThemeService themeService;

  @GetMapping
  public ResponseEntity<List<ThemeRes>> list() {
    return ResponseEntity.ok(themeService.adminList());
  }

  @PostMapping
  public ResponseEntity<ThemeRes> create(@RequestBody ThemeReq req) {
    return ResponseEntity.ok(themeService.create(req));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ThemeRes> update(@PathVariable Long id, @RequestBody ThemeReq req) {
    return ResponseEntity.ok(themeService.update(id, req));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    themeService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
