package com.avanibank.backend.dto;

public class StaffLoginRequest {

    private String email;
    private String password;

    public StaffLoginRequest() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}