package com.thubongshop.backend.analytics.dto;

import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StatsFilter {
  /** inclusive */
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private LocalDate start;
  /** inclusive */
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private LocalDate end;

  /** DAY|WEEK|MONTH */
  private String groupBy;

  /** múi giờ phút (VD: +07:00 => 420) để cut theo ngày cho đúng timezone */
  private Integer tzOffsetMinutes;

  /** giới hạn top-N cho các bảng xếp hạng */
  private Integer limit;

  /** so sánh (optional) */
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private LocalDate compareStart;
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private LocalDate compareEnd;
}
