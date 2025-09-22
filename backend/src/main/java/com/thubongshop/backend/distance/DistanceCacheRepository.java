package com.thubongshop.backend.distance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DistanceCacheRepository extends JpaRepository<DistanceCache, Long> {
  Optional<DistanceCache> findFirstByFromLatAndFromLngAndToLatAndToLng(
      Double flt, Double fln, Double tlt, Double tln);
}
