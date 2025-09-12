package com.thubongshop.backend.supplier;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.*;

@Getter
@Setter
public class SupplierRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 100)
    private String contactPerson;

    @Size(max = 20)
    private String phone;

    @Email(message = "Email không hợp lệ")
    @Size(max = 100)
    private String email;

    @Size(max = 10_000)
    private String address;
}
