package com.thubongshop.backend.address;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter; import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/api/addresses")
public class AddressController {
  private final UserAddressRepository repo;
  public AddressController(UserAddressRepository repo){ this.repo=repo; }

  @GetMapping
  public List<UserAddress> my(@RequestParam Integer userId) {
    return repo.findByUserIdOrderByIdDesc(userId);
  }

  @PostMapping
  public UserAddress create(@Valid @RequestBody CreateAddress req) {
    UserAddress a = new UserAddress();
    a.setUserId(req.getUserId()); a.setLabel(req.getLabel());
    a.setReceiverName(req.getReceiverName()); a.setPhone(req.getPhone());
    a.setProvinceCode(req.getProvinceCode()); a.setDistrictCode(req.getDistrictCode());
    a.setWardCode(req.getWardCode()); a.setAddressLine(req.getAddressLine());
    a.setLatitude(req.getLatitude()); a.setLongitude(req.getLongitude());
    a.setIsDefault(Boolean.TRUE.equals(req.getIsDefault()));
    return repo.save(a);
  }

  @PatchMapping("/{id}/default")
  public ResponseEntity<?> setDefault(@PathVariable Integer id, @RequestParam Integer userId) {
    repo.findByUserIdOrderByIdDesc(userId).forEach(a -> {
      a.setIsDefault(a.getId().equals(id)); repo.save(a);
    });
    return ResponseEntity.ok().build();
  }

  @Getter @Setter
  public static class CreateAddress {
    private Integer userId;
    private String label;
    @NotBlank private String receiverName;
    @NotBlank private String phone;
    @NotBlank private String provinceCode;
    @NotBlank private String districtCode;
    @NotBlank private String wardCode;
    @NotBlank private String addressLine;
    private Double latitude; private Double longitude;
    private Boolean isDefault=false;
  }
}
