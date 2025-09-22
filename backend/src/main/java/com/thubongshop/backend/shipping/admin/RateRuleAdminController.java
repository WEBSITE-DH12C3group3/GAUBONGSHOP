package com.thubongshop.backend.shipping.admin;

import com.thubongshop.backend.shared.BusinessException;
import com.thubongshop.backend.shipping.dto.RateRuleDTO;
import com.thubongshop.backend.shipping.rate.*;
import com.thubongshop.backend.shipping.service.ShippingServiceRepo;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/shipping/rate-rules")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('manage_shippingrate')")
public class RateRuleAdminController {

  private final CarrierRateRuleRepo repo;
  private final ShippingServiceRepo serviceRepo;

  @GetMapping("/by-service/{serviceId}")
  public List<RateRuleDTO> byService(@PathVariable Integer serviceId) {
    return repo.findByServiceIdOrderByMinKmAsc(serviceId).stream().map(this::toDto).toList();
  }

  @GetMapping("/{id}")
  public RateRuleDTO get(@PathVariable Integer id) {
    return toDto(repo.findById(id).orElseThrow(() -> new BusinessException("NOT_FOUND","Rule không tồn tại")));
  }

  @PostMapping
  public RateRuleDTO create(@Valid @RequestBody RateRuleDTO dto) {
    var svc = serviceRepo.findById(dto.getServiceId())
        .orElseThrow(() -> new BusinessException("NOT_FOUND","Service không tồn tại"));
    var saved = repo.save(CarrierRateRule.builder()
        .service(svc).minKm(dto.getMinKm()).maxKm(dto.getMaxKm())
        .baseFee(dto.getBaseFee()).perKmFee(dto.getPerKmFee())
        .minFee(dto.getMinFee()).freeKm(dto.getFreeKm())
        .codSurcharge(dto.getCodSurcharge()).areaSurcharge(dto.getAreaSurcharge())
        .activeFrom(dto.getActiveFrom()).activeTo(dto.getActiveTo())
        .active(dto.getActive()==null?true:dto.getActive())
        .build());
    dto.setId(saved.getId());
    return dto;
  }

  @PutMapping("/{id}")
  public RateRuleDTO update(@PathVariable Integer id, @Valid @RequestBody RateRuleDTO dto) {
    var r = repo.findById(id).orElseThrow(() -> new BusinessException("NOT_FOUND","Rule không tồn tại"));
    var svc = serviceRepo.findById(dto.getServiceId())
        .orElseThrow(() -> new BusinessException("NOT_FOUND","Service không tồn tại"));
    r.setService(svc);
    r.setMinKm(dto.getMinKm()); r.setMaxKm(dto.getMaxKm());
    r.setBaseFee(dto.getBaseFee()); r.setPerKmFee(dto.getPerKmFee());
    r.setMinFee(dto.getMinFee()); r.setFreeKm(dto.getFreeKm());
    r.setCodSurcharge(dto.getCodSurcharge()); r.setAreaSurcharge(dto.getAreaSurcharge());
    r.setActiveFrom(dto.getActiveFrom()); r.setActiveTo(dto.getActiveTo());
    if (dto.getActive()!=null) r.setActive(dto.getActive());
    repo.save(r);
    dto.setId(id);
    return dto;
  }

  @PatchMapping("/{id}/toggle")
  public RateRuleDTO toggle(@PathVariable Integer id) {
    var r = repo.findById(id).orElseThrow(() -> new BusinessException("NOT_FOUND","Rule không tồn tại"));
    r.setActive(!Boolean.TRUE.equals(r.getActive()));
    repo.save(r);
    return toDto(r);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Integer id) {
    if (!repo.existsById(id)) throw new BusinessException("NOT_FOUND","Rule không tồn tại");
    repo.deleteById(id);
  }

  private RateRuleDTO toDto(CarrierRateRule r) {
    return RateRuleDTO.builder()
      .id(r.getId()).serviceId(r.getService().getId())
      .minKm(r.getMinKm()).maxKm(r.getMaxKm())
      .baseFee(r.getBaseFee()).perKmFee(r.getPerKmFee())
      .minFee(r.getMinFee()).freeKm(r.getFreeKm())
      .codSurcharge(r.getCodSurcharge()).areaSurcharge(r.getAreaSurcharge())
      .activeFrom(r.getActiveFrom()).activeTo(r.getActiveTo())
      .active(r.getActive()).build();
  }
}
