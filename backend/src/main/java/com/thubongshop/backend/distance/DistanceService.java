package com.thubongshop.backend.distance;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DistanceService {
  private final DistanceCacheRepository cache;

  public DistanceService(DistanceCacheRepository cache) { this.cache = cache; }

  // TODO: bạn có thể tích hợp API Drive Distance (Google/Mapbox/VietMap).
  // Hiện tại dùng Haversine * 1.25 (xấp xỉ đường đi thực tế)
  public double computeDrivingDistanceKm(double fromLat, double fromLng, double toLat, double toLng) {
    return haversineKm(fromLat, fromLng, toLat, toLng) * 1.25;
  }

  public double getOrCompute(double fromLat, double fromLng, double toLat, double toLng) {
    return cache.findFirstByFromLatAndFromLngAndToLatAndToLng(fromLat, fromLng, toLat, toLng)
        .map(DistanceCache::getDistanceKm)
        .orElseGet(() -> {
          double d = computeDrivingDistanceKm(fromLat, fromLng, toLat, toLng);
          DistanceCache c = new DistanceCache();
          c.setFromLat(fromLat); c.setFromLng(fromLng);
          c.setToLat(toLat); c.setToLng(toLng);
          c.setDistanceKm(d); c.setSource(DistanceCache.Source.HAVERSINE);
          cache.save(c);
          return d;
        });
  }

  // Haversine
  static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
    double R=6371.0088;
    double dLat=Math.toRadians(lat2-lat1), dLon=Math.toRadians(lon2-lon1);
    double a=Math.sin(dLat/2)*Math.sin(dLat/2)
           + Math.cos(Math.toRadians(lat1))*Math.cos(Math.toRadians(lat2))
           * Math.sin(dLon/2)*Math.sin(dLon/2);
    return 2*R*Math.asin(Math.sqrt(a));
  }
}
