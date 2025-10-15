package com.thubongshop.backend.theme;

import com.thubongshop.backend.category.Category;
import com.thubongshop.backend.category.CategoryRepository;
import com.thubongshop.backend.theme.dto.ThemeDtos.CategoryBrief;
import com.thubongshop.backend.theme.dto.ThemeDtos.ThemeReq;
import com.thubongshop.backend.theme.dto.ThemeDtos.ThemeRes;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ThemeService {

  private final ThemeRepository themeRepo;
  private final CategoryRepository categoryRepo;

  /* ================= PUBLIC ================= */

  @Transactional(readOnly = true)
  public List<ThemeRes> findAllPublic() {
    return themeRepo.findAllByOrderByNameAsc()
        .stream()
        .map(this::toRes)
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public ThemeRes findBySlug(String slug) {
    String normalized = safeSlug(slug, slug);
    Theme theme = themeRepo.findBySlug(normalized)
        .orElseThrow(() -> new EntityNotFoundException("Theme not found"));
    return toRes(theme);
  }

  /* ================= ADMIN ================= */

  @Transactional(readOnly = true)
  public List<ThemeRes> adminList() {
    return themeRepo.findAllByOrderByNameAsc()
        .stream()
        .map(this::toRes)
        .collect(Collectors.toList());
  }

  @Transactional
  public ThemeRes create(ThemeReq req) {
    String name = trimOrNull(req.getName());
    String slug = trimOrNull(req.getSlug());
    String description = trimOrNull(req.getDescription());

    validateUnique(name, slug, null);

    Theme th = new Theme();
    th.setName(name);
    th.setSlug(safeSlug(slug, name));
    th.setDescription(description);
    th.setCategories(fetchCategories(req.getCategoryIds()));

    Theme saved = themeRepo.save(th);
    return toRes(saved);
  }

  @Transactional
  public ThemeRes update(Long id, ThemeReq req) {
    Theme th = themeRepo.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Theme not found"));

    String name = trimOrNull(req.getName());
    String slug = trimOrNull(req.getSlug());
    String description = trimOrNull(req.getDescription());

    validateUnique(name, slug, id);

    th.setName(name);
    th.setSlug(safeSlug(slug, name));
    th.setDescription(description);

    if (req.getCategoryIds() != null) {
      th.setCategories(fetchCategories(req.getCategoryIds()));
    }

    return toRes(th);
  }

  @Transactional
  public void delete(Long id) {
    if (themeRepo.existsById(id)) themeRepo.deleteById(id);
  }

  /* ================= HELPERS ================= */

  private ThemeRes toRes(Theme t) {
    // Không gọi c.getSlug() nữa — tự sinh slug từ name để tránh lỗi compile
    List<CategoryBrief> cats =
        t.getCategories() == null
            ? Collections.emptyList()
            : t.getCategories().stream()
                .map(c -> new CategoryBrief(
                    c.getId(),
                    c.getName(),
                    // generate slug from name (or whatever you prefer)
                    safeSlug(null, c.getName())
                ))
                .collect(Collectors.toList());

    return new ThemeRes(
        t.getId(),
        t.getName(),
        t.getSlug(),
        t.getDescription(),
        cats,
        cats.size()
    );
  }

  /** Tải Category theo id; null/empty -> set rỗng. */
  private Set<Category> fetchCategories(List<Long> ids) {
    if (ids == null || ids.isEmpty()) return Collections.emptySet();
    return new HashSet<>(categoryRepo.findAllById(ids));
  }

  /** Chuẩn hoá slug; nếu rỗng dùng fallback. */
  private String safeSlug(String inputSlug, String fallbackName) {
    String s = trimOrNull(inputSlug);
    if (isBlank(s)) s = trimOrNull(fallbackName);
    if (isBlank(s)) s = "theme";
    return Normalizer.normalize(s, Normalizer.Form.NFD)
        .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
        .toLowerCase(Locale.ROOT)
        .replaceAll("[^a-z0-9\\-\\s]", "")
        .trim()
        .replaceAll("\\s+", "-");
  }

  /** Kiểm tra trùng tên/slug; cho phép trùng với chính bản ghi đang sửa. */
  private void validateUnique(String name, String slug, Long currentId) {
    if (isBlank(name)) throw new IllegalArgumentException("Tên chủ đề không được để trống");

    boolean nameExists = themeRepo.existsByName(name);
    if (nameExists && (currentId == null ||
        themeRepo.findById(currentId).map(t -> !name.equals(t.getName())).orElse(true))) {
      throw new IllegalArgumentException("Tên chủ đề đã tồn tại");
    }

    if (!isBlank(slug)) {
      String normalized = safeSlug(slug, name);
      boolean slugExists = themeRepo.existsBySlug(normalized);
      if (slugExists && (currentId == null ||
          themeRepo.findById(currentId).map(t -> !normalized.equals(t.getSlug())).orElse(true))) {
        throw new IllegalArgumentException("Slug chủ đề đã tồn tại");
      }
    }
  }

  private static boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
  private static String trimOrNull(String s) { return s == null ? null : s.trim(); }
}
