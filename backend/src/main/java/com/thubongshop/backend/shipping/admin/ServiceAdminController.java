package com.thubongshop.backend.shipping.admin;

import com.thubongshop.backend.shared.BusinessException;
import com.thubongshop.backend.shipping.carrier.*;
import com.thubongshop.backend.shipping.dto.ServiceDTO;
import com.thubongshop.backend.shipping.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/shipping/services")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('manage_shippingrate')")
public class ServiceAdminController {

  private final ShippingServiceRepo repo;
  private final ShippingCarrierRepo carrierRepo;

  @GetMapping("/by-carrier/{carrierId}")
  public List<ServiceDTO> byCarrier(@PathVariable Integer carrierId) {
    return repo.findByCarrierIdOrderByCodeAsc(carrierId).stream().map(s ->
      ServiceDTO.builder()
        .id(s.getId()).carrierId(s.getCarrier().getId()).code(s.getCode()).label(s.getLabel())
        .active(s.getActive()).baseDaysMin(s.getBaseDaysMin()).baseDaysMax(s.getBaseDaysMax()).build()
    ).toList();
  }

  @GetMapping("/{id}")
  public ServiceDTO get(@PathVariable Integer id) {
    var s = repo.findById(id).orElseThrow(() -> new BusinessException("NOT_FOUND","Service không tồn tại"));
    return ServiceDTO.builder()
      .id(s.getId()).carrierId(s.getCarrier().getId()).code(s.getCode()).label(s.getLabel())
      .active(s.getActive()).baseDaysMin(s.getBaseDaysMin()).baseDaysMax(s.getBaseDaysMax()).build();
  }

  @PostMapping
  public ServiceDTO create(@Valid @RequestBody ServiceDTO dto) {
    var carrier = carrierRepo.findById(dto.getCarrierId())
        .orElseThrow(() -> new BusinessException("NOT_FOUND","Carrier không tồn tại"));
    if (repo.existsByCarrierAndCodeIgnoreCase(carrier, dto.getCode()))
      throw new BusinessException("DUPLICATE","Code dịch vụ đã tồn tại trong carrier");
    var saved = repo.save(ShippingServiceEntity.builder()
        .carrier(carrier).code(dto.getCode().trim()).label(dto.getLabel().trim())
        .active(dto.getActive()==null?true:dto.getActive())
        .baseDaysMin(dto.getBaseDaysMin()==null?2:dto.getBaseDaysMin())
        .baseDaysMax(dto.getBaseDaysMax()==null?4:dto.getBaseDaysMax()).build());
    dto.setId(saved.getId());
    return dto;
  }

  @PutMapping("/{id}")
  public ServiceDTO update(@PathVariable Integer id, @Valid @RequestBody ServiceDTO dto) {
    var s = repo.findById(id).orElseThrow(() -> new BusinessException("NOT_FOUND","Service không tồn tại"));
    var carrier = carrierRepo.findById(dto.getCarrierId())
        .orElseThrow(() -> new BusinessException("NOT_FOUND","Carrier không tồn tại"));
    if ((!s.getCarrier().getId().equals(carrier.getId()) || !s.getCode().equalsIgnoreCase(dto.getCode()))
        && repo.existsByCarrierAndCodeIgnoreCase(carrier, dto.getCode()))
      throw new BusinessException("DUPLICATE","Code dịch vụ đã tồn tại trong carrier");
    s.setCarrier(carrier);
    s.setCode(dto.getCode().trim());
    s.setLabel(dto.getLabel().trim());
    if (dto.getActive()!=null) s.setActive(dto.getActive());
    s.setBaseDaysMin(dto.getBaseDaysMin()==null? s.getBaseDaysMin() : dto.getBaseDaysMin());
    s.setBaseDaysMax(dto.getBaseDaysMax()==null? s.getBaseDaysMax() : dto.getBaseDaysMax());
    repo.save(s);
    dto.setId(id);
    return dto;
  }

  @PatchMapping("/{id}/toggle")
  public ServiceDTO toggle(@PathVariable Integer id) {
    var s = repo.findById(id).orElseThrow(() -> new BusinessException("NOT_FOUND","Service không tồn tại"));
    s.setActive(!Boolean.TRUE.equals(s.getActive()));
    repo.save(s);
    return ServiceDTO.builder()
      .id(s.getId()).carrierId(s.getCarrier().getId()).code(s.getCode()).label(s.getLabel())
      .active(s.getActive()).baseDaysMin(s.getBaseDaysMin()).baseDaysMax(s.getBaseDaysMax()).build();
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Integer id) {
    if (!repo.existsById(id)) throw new BusinessException("NOT_FOUND","Service không tồn tại");
    repo.deleteById(id);
  }
}
