package com.thubongshop.backend.cart.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SelectRequest {
    private Boolean selected; // true = chọn, false = bỏ chọn
}
