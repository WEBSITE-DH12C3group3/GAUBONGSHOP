package com.thubongshop.backend.user.reset.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {
    @NotBlank @Email
    private String email;

    @NotBlank
    @Pattern(regexp = "\\d{6}", message = "Mã phải gồm 6 chữ số")
    private String code;

    @NotBlank
    @Size(min = 6, max = 100)
    private String newPassword;

    public String getEmail() { return email; }
    public String getCode() { return code; }
    public String getNewPassword() { return newPassword; }

    public void setEmail(String email) { this.email = email; }
    public void setCode(String code) { this.code = code; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
