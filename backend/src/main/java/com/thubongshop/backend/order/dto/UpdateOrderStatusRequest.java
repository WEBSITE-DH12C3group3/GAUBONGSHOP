package com.thubongshop.backend.order.dto;

import com.thubongshop.backend.order.OrderStatus;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UpdateOrderStatusRequest {
    private OrderStatus status;
}
