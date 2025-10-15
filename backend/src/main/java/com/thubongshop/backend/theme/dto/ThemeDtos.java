package com.thubongshop.backend.theme.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

public class ThemeDtos {

  @Getter @Setter
  public static class ThemeReq {
    private String name;
    private String slug;
    private String description;
    private List<Long> categoryIds;
  }

  @Getter @Setter
  public static class CategoryBrief {
    private Long id;
    private String name;
    private String slug;

    public CategoryBrief() {}
    public CategoryBrief(Long id, String name, String slug) {
      this.id = id;
      this.name = name;
      this.slug = slug;
    }
  }

  @Getter @Setter
  public static class ThemeRes {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private List<CategoryBrief> categories;
    private int categoryCount;

    public ThemeRes() {}
    public ThemeRes(Long id, String name, String slug, String description,
                    List<CategoryBrief> categories, int categoryCount) {
      this.id = id;
      this.name = name;
      this.slug = slug;
      this.description = description;
      this.categories = categories;
      this.categoryCount = categoryCount;
    }
  }
}
