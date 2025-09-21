package com.thubongshop.backend.user.reset.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class VerifyCodeRequest {
    @NotBlank @Email
    private String email;

    @NotBlank
    @Pattern(regexp = "\\d{6}", message = "Mã phải gồm 6 chữ số")
    private String code;

    public String getEmail() { return email; }
    public String getCode() { return code; }
    public void setEmail(String email) { this.email = email; }
    public void setCode(String code) { this.code = code; }
}
