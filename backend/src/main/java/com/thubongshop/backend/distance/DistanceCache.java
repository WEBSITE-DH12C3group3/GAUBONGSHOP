package com.thubongshop.backend.distance;

import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;

@Entity @Table(name="distance_cache")
@Getter @Setter
public class DistanceCache {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(name="from_lat", nullable=false) private Double fromLat;
  @Column(name="from_lng", nullable=false) private Double fromLng;
  @Column(name="to_lat",   nullable=false) private Double toLat;
  @Column(name="to_lng",   nullable=false) private Double toLng;
  @Column(name="distance_km", nullable=false) private Double distanceKm;
  @Enumerated(EnumType.STRING) @Column(nullable=false)
  private Source source = Source.HAVERSINE;
  public enum Source { DRIVING, HAVERSINE }
}
