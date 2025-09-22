package com.thubongshop.backend.cart.dto;

import lombok.Data;
import java.util.List;

@Data
public class MergeCartRequest {
    private List<MergeCartItem> items;
}
