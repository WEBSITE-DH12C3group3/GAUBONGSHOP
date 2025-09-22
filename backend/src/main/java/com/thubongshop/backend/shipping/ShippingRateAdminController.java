package com.thubongshop.backend.shipping;

import com.thubongshop.backend.shared.BusinessException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/shipping-rates")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('manage_shippingrate')")
public class ShippingRateAdminController {

  private final ShippingRateRepo repo;

  // -------- LIST (filter + paging + sort) ----------
  @GetMapping
  public Page<ShippingRate> list(
      @RequestParam(required = false) String query,
      @RequestParam(required = false) String active, // "true" | "false" | null(all)
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "carrier,asc") String sort
  ) {
    Sort s = Sort.by(sort.split(",")[0]);
    if (sort.toLowerCase().endsWith(",desc")) s = s.descending();
    Pageable pageable = PageRequest.of(page, size, s);

    // đơn giản: filter bằng memory với Page impl (tuỳ DB bạn có thể viết Spec/Query)
    var all = repo.findAll(s);
    var stream = all.stream();

    if (query != null && !query.isBlank()) {
      var q = query.trim().toLowerCase();
      stream = stream.filter(r -> r.getCarrier() != null && r.getCarrier().toLowerCase().contains(q));
    }
    if ("true".equalsIgnoreCase(active))   stream = stream.filter(r -> Boolean.TRUE.equals(r.getActive()));
    if ("false".equalsIgnoreCase(active))  stream = stream.filter(r -> Boolean.FALSE.equals(r.getActive()));

    var list = stream.toList();
    int start = Math.min((int) pageable.getOffset(), list.size());
    int end   = Math.min((start + pageable.getPageSize()), list.size());
    return new PageImpl<>(list.subList(start, end), pageable, list.size());
  }

  // -------- GET ONE ----------
  @GetMapping("/{id}")
  public ShippingRate getOne(@PathVariable Integer id) {
    return repo.findById(id)
      .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy đơn vị vận chuyển"));
  }

  // -------- CREATE ----------
  public record UpsertReq(
      @NotBlank String carrier,
      @Min(0) BigDecimal baseFee,
      @Min(0) BigDecimal feePerKg,
      BigDecimal freeThreshold,
      Boolean active
  ) {}

  @PostMapping
  public ShippingRate create(@Valid @RequestBody UpsertReq req) {
    var r = ShippingRate.builder()
      .carrier(req.carrier().trim())
      .baseFee(req.baseFee() == null ? BigDecimal.ZERO : req.baseFee())
      .feePerKg(req.feePerKg() == null ? BigDecimal.ZERO : req.feePerKg())
      .freeThreshold(req.freeThreshold())
      .active(req.active() == null ? Boolean.TRUE : req.active())
      .createdAt(LocalDateTime.now())
      .updatedAt(LocalDateTime.now())
      .build();
    return repo.save(r);
  }

  // -------- UPDATE ----------
  @PutMapping("/{id}")
  public ShippingRate update(@PathVariable Integer id, @Valid @RequestBody UpsertReq req) {
    var r = repo.findById(id)
      .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy đơn vị vận chuyển"));
    r.setCarrier(req.carrier().trim());
    r.setBaseFee(req.baseFee() == null ? BigDecimal.ZERO : req.baseFee());
    r.setFeePerKg(req.feePerKg() == null ? BigDecimal.ZERO : req.feePerKg());
    r.setFreeThreshold(req.freeThreshold());
    r.setActive(req.active() == null ? r.getActive() : req.active());
    r.setUpdatedAt(LocalDateTime.now());
    return repo.save(r);
  }

  // -------- TOGGLE ACTIVE ----------
  @PatchMapping("/{id}/toggle")
  public ShippingRate toggle(@PathVariable Integer id) {
    var r = repo.findById(id)
      .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy đơn vị vận chuyển"));
    r.setActive(!Boolean.TRUE.equals(r.getActive()));
    r.setUpdatedAt(LocalDateTime.now());
    return repo.save(r);
  }

  // -------- DELETE ----------
  @DeleteMapping("/{id}")
  public ResponseEntity<?> delete(@PathVariable Integer id) {
    if (!repo.existsById(id)) {
      throw new BusinessException("NOT_FOUND", "Không tìm thấy đơn vị vận chuyển");
    }
    repo.deleteById(id);
    return ResponseEntity.ok(Map.of("success", true));
  }
}
