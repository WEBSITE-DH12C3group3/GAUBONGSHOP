package com.thubongshop.backend.shipping.admin;

import com.thubongshop.backend.shared.BusinessException;
import com.thubongshop.backend.shipping.carrier.*;
import com.thubongshop.backend.shipping.dto.CarrierDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/shipping/carriers")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('manage_shippingrate')")
public class CarrierAdminController {

  private final ShippingCarrierRepo repo;

  @GetMapping
  public Page<CarrierDTO> list(@RequestParam(defaultValue="0") int page,
                               @RequestParam(defaultValue="10") int size,
                               @RequestParam(defaultValue="code,asc") String sort,
                               @RequestParam(required=false) String q,
                               @RequestParam(required=false) Boolean active) {
    var s = sort.toLowerCase().endsWith(",desc")
        ? Sort.by(sort.split(",")[0]).descending()
        : Sort.by(sort.split(",")[0]).ascending();
    var pageable = PageRequest.of(page, size, s);
    var all = repo.findAll(s);
    var stream = all.stream();
    if (q != null && !q.isBlank()) {
      var qq = q.toLowerCase();
      stream = stream.filter(c -> c.getCode().toLowerCase().contains(qq) || c.getName().toLowerCase().contains(qq));
    }
    if (active != null) stream = stream.filter(c -> active.equals(c.getActive()));
    var list = stream.map(c -> CarrierDTO.builder()
            .id(c.getId()).code(c.getCode()).name(c.getName()).active(c.getActive()).build())
        .toList();
    int start = Math.min((int) pageable.getOffset(), list.size());
    int end   = Math.min(start + pageable.getPageSize(), list.size());
    return new PageImpl<>(list.subList(start, end), pageable, list.size());
  }

  @GetMapping("/{id}")
  public CarrierDTO get(@PathVariable Integer id) {
    var c = repo.findById(id).orElseThrow(() -> new BusinessException("NOT_FOUND","Carrier không tồn tại"));
    return CarrierDTO.builder().id(c.getId()).code(c.getCode()).name(c.getName()).active(c.getActive()).build();
  }

  @PostMapping
  public CarrierDTO create(@Valid @RequestBody CarrierDTO dto) {
    if (repo.existsByCodeIgnoreCase(dto.getCode()))
      throw new BusinessException("DUPLICATE","Mã carrier đã tồn tại");
    var saved = repo.save(ShippingCarrier.builder()
        .code(dto.getCode().trim())
        .name(dto.getName().trim())
        .active(dto.getActive() == null ? true : dto.getActive())
        .build());
    dto.setId(saved.getId());
    return dto;
  }

  @PutMapping("/{id}")
  public CarrierDTO update(@PathVariable Integer id, @Valid @RequestBody CarrierDTO dto) {
    var c = repo.findById(id).orElseThrow(() -> new BusinessException("NOT_FOUND","Carrier không tồn tại"));
    if (!c.getCode().equalsIgnoreCase(dto.getCode()) && repo.existsByCodeIgnoreCase(dto.getCode()))
      throw new BusinessException("DUPLICATE","Mã carrier đã tồn tại");
    c.setCode(dto.getCode().trim());
    c.setName(dto.getName().trim());
    c.setActive(dto.getActive() == null ? c.getActive() : dto.getActive());
    repo.save(c);
    dto.setId(id);
    return dto;
  }

  @PatchMapping("/{id}/toggle")
  public CarrierDTO toggle(@PathVariable Integer id) {
    var c = repo.findById(id).orElseThrow(() -> new BusinessException("NOT_FOUND","Carrier không tồn tại"));
    c.setActive(!Boolean.TRUE.equals(c.getActive()));
    repo.save(c);
    return CarrierDTO.builder().id(c.getId()).code(c.getCode()).name(c.getName()).active(c.getActive()).build();
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Integer id) {
    if (!repo.existsById(id)) throw new BusinessException("NOT_FOUND","Carrier không tồn tại");
    repo.deleteById(id);
  }
}
