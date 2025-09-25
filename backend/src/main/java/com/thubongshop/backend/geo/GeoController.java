// src/main/java/com/thubongshop/backend/geo/GeoController.java
package com.thubongshop.backend.geo;

import com.thubongshop.backend.geo.dto.AddressComponents;
import com.thubongshop.backend.geo.dto.ReverseReq;
import com.thubongshop.backend.geo.dto.SuggestItem;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/geo")
public class GeoController {

  private final GeoProvider geoProvider;

  @PostMapping("/reverse")
  public ResponseEntity<AddressComponents> reverse(@Valid @RequestBody ReverseReq req) {
    var addr = geoProvider.reverse(req.lat().doubleValue(), req.lng().doubleValue());
    return ResponseEntity.ok(addr);
  }

  @GetMapping("/suggest")
  public ResponseEntity<List<SuggestItem>> suggest(
      @RequestParam String query,
      @RequestParam(required = false) String province,
      @RequestParam(required = false) String district,
      @RequestParam(defaultValue = "8") int limit
  ) {
    return ResponseEntity.ok(geoProvider.suggest(query, province, district, limit));
  }
}
