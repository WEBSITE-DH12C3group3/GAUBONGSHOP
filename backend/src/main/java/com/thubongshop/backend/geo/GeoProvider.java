// src/main/java/com/thubongshop/backend/geo/GeoProvider.java
package com.thubongshop.backend.geo;

import com.thubongshop.backend.geo.dto.AddressComponents;
import com.thubongshop.backend.geo.dto.SuggestItem;

import java.util.List;

public interface GeoProvider {
  AddressComponents reverse(double lat, double lng);
  List<SuggestItem> suggest(String query, String province, String district, int limit);
}
