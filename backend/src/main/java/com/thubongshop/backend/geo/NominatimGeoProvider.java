// src/main/java/com/thubongshop/backend/geo/NominatimGeoProvider.java
package com.thubongshop.backend.geo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.thubongshop.backend.geo.dto.AddressComponents;
import com.thubongshop.backend.geo.dto.SuggestItem;
import com.thubongshop.backend.shared.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NominatimGeoProvider implements GeoProvider {

  // Dùng public Nominatim (nên self-host hoặc dùng Mapbox/Google ở production)
  private final WebClient webClient = WebClient.builder()
      .baseUrl("https://nominatim.openstreetmap.org")
      .defaultHeader("User-Agent", "thubongshop/1.0")
      .build();

  @Override
  public AddressComponents reverse(double lat, double lng) {
    NominatimReverseResp resp = webClient.get()
        .uri(uriBuilder -> uriBuilder
            .path("/reverse")
            .queryParam("format", "jsonv2")
            .queryParam("lat", lat)
            .queryParam("lon", lng)
            .queryParam("addressdetails", 1)
            .build())
        .accept(MediaType.APPLICATION_JSON)
        .retrieve()
        .bodyToMono(NominatimReverseResp.class)
        .block();

    if (resp == null || resp.address == null) {
      throw new BusinessException("GEOCODE_FAIL", "Không lấy được địa chỉ từ toạ độ.");
    }

    var a = resp.address;
    String province = or(a.state, a.province); // Nominatim có thể trả 'state' hoặc 'province'
    String district = or(a.county, a.city_district, a.district);
    String ward     = or(a.suburb, a.town, a.village, a.suburb, a.quarter);
    String street   = or(a.road, a.residential, a.neighbourhood, a.hamlet);
    String postal   = a.postcode;

    return new AddressComponents(
        resp.display_name,
        province,
        district,
        ward,
        street,
        postal,
        toBd(resp.lat),
        toBd(resp.lon)
    );
  }

 @Override
    public List<SuggestItem> suggest(String query, String province, String district, int limit) {
    // build chuỗi truy vấn nhưng KHÔNG gán lại biến dùng trong lambda
    final String qParam = buildQuery(query, province, district);
    final int lim = (limit <= 0 ? 8 : limit); // cũng tạo biến final cho chắc

    NominatimSearchResp[] resps = webClient.get()
        .uri(uriBuilder -> uriBuilder
            .path("/search")
            .queryParam("q", qParam)
            .queryParam("format", "jsonv2")
            .queryParam("addressdetails", 1)
            .queryParam("limit", lim)
            .build())
        .accept(MediaType.APPLICATION_JSON)
        .retrieve()
        .bodyToMono(NominatimSearchResp[].class)
        .block();

    List<SuggestItem> out = new ArrayList<>();
    if (resps != null) {
        for (var r : resps) {
        var a = r.address;
        String provinceGuess = or(a.state, a.province);
        String districtGuess = or(a.county, a.city_district, a.district);
        String wardGuess     = or(a.suburb, a.town, a.village, a.quarter);
        String streetGuess   = or(a.road, a.residential, a.neighbourhood, a.hamlet);
        out.add(new SuggestItem(
            r.display_name,
            r.display_name,
            provinceGuess,
            districtGuess,
            wardGuess,
            streetGuess,
            a.postcode,
            toBd(r.lat),
            toBd(r.lon)
        ));
        }
    }
    return out;
    }

    private static String buildQuery(String query, String province, String district) {
    StringBuilder sb = new StringBuilder();
    if (query != null && !query.isBlank()) sb.append(query);
    if (province != null && !province.isBlank()) sb.append(", ").append(province);
    if (district != null && !district.isBlank()) sb.append(", ").append(district);
    return sb.toString();
    }


  private static BigDecimal toBd(String s) {
    try { return new BigDecimal(s); } catch (Exception e) { return null; }
  }
  private static String or(String... v) {
    for (var x: v) if (x != null && !x.isBlank()) return x;
    return null;
  }

  // --- Nominatim models ---
  @JsonIgnoreProperties(ignoreUnknown = true)
  static class NominatimReverseResp {
    public String lat;
    public String lon;
    public String display_name;
    public Address address;
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  static class NominatimSearchResp {
    public String lat;
    public String lon;
    public String display_name;
    public Address address;
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  static class Address {
    public String house_number;
    public String road;
    public String neighbourhood;
    public String residential;
    public String suburb;
    public String city_district;
    public String district;
    public String county;
    public String city;
    public String town;
    public String village;
    public String province;
    public String state;
    public String postcode;
    public String quarter;
    public String hamlet;
  }
}
