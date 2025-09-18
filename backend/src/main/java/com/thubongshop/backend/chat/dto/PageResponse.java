package com.thubongshop.backend.chat.dto;

import org.springframework.data.domain.Page;
import java.util.List;
import java.util.function.Function;

public record PageResponse<T>(List<T> content, int number, int size, long totalElements, int totalPages) {
  public static <T, R> PageResponse<R> map(Page<T> page, Function<T,R> mapper) {
    return new PageResponse<>(
      page.getContent().stream().map(mapper).toList(),
      page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages()
    );
  }
}
