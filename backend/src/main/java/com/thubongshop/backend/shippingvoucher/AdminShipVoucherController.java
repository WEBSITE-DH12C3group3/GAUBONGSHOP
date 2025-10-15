package com.thubongshop.backend.shippingvoucher;

import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/shipping-vouchers")
@CrossOrigin(origins = "*")
public class AdminShipVoucherController {

  private final ShipVoucherRepo repo;
  private final ShipVoucherService service;

  public AdminShipVoucherController(ShipVoucherRepo repo, ShipVoucherService service) {
    this.repo = repo;
    this.service = service;
  }

  @GetMapping
  public Map<String, Object> list(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "id,desc") String sort,
      @RequestParam(required = false) String q
  ) {
    Pageable pageable = buildPageable(page, size, sort);
    Page<ShipVoucher> p = (q != null && !q.isBlank())
        ? repo.findAll((root, cq, cb) ->
          cb.like(cb.lower(root.get("code")), "%" + q.toLowerCase() + "%"), pageable)
        : repo.findAll(pageable);
    List<ShipVoucherResponse> items = p.getContent().stream().map(service::toResponse).toList();
    return Map.of("items", items, "page", p.getNumber(), "size", p.getSize(),
        "totalPages", p.getTotalPages(), "total", p.getTotalElements());
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> get(@PathVariable Integer id) {
    return repo.findById(id)
        .<ResponseEntity<?>>map(v -> ResponseEntity.ok(Map.of("voucher", service.toResponse(v))))
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping
  public ResponseEntity<?> create(@Valid @RequestBody ShipVoucherRequest r) {
    ShipVoucher v = service.create(r);
    return ResponseEntity.ok(Map.of("voucher", service.toResponse(v)));
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody ShipVoucherRequest r) {
    ShipVoucher v = service.update(id, r);
    if (v == null) return ResponseEntity.notFound().build();
    return ResponseEntity.ok(Map.of("voucher", service.toResponse(v)));
  }

  @PatchMapping("/{id}/active")
  public ResponseEntity<?> setActive(@PathVariable Integer id, @RequestParam boolean value) {
    ShipVoucher v = service.setActive(id, value);
    if (v == null) return ResponseEntity.notFound().build();
    return ResponseEntity.ok(Map.of("voucher", service.toResponse(v)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> delete(@PathVariable Integer id) {
    if (!repo.existsById(id)) return ResponseEntity.notFound().build();
    repo.deleteById(id);
    return ResponseEntity.ok(Map.of("ok", true));
  }

  private Pageable buildPageable(int page, int size, String sort) {
    try {
      String[] sp = sort.split(",");
      Sort.Direction dir = (sp.length > 1) ? Sort.Direction.fromString(sp[1]) : Sort.Direction.DESC;
      return PageRequest.of(page, size, Sort.by(dir, sp[0]));
    } catch (Exception e) {
      return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
    }
  }
}
