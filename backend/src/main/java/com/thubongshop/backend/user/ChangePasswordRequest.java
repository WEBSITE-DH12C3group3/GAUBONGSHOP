// backend/user/ChangePasswordRequest.java
package com.thubongshop.backend.user;

public class ChangePasswordRequest {
    private String currentPassword;
    private String newPassword;

    // getter & setter
    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
