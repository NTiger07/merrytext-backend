package com.favour.merrytext.security;

public class AuthRequest {
    private String username_email;
    private String password;

    public AuthRequest() {
    }

    public AuthRequest(String username_email, String password) {
        this.username_email = username_email;
        this.password = password;
    }

    public String getUsernameEmail() {
        return username_email;
    }

    public void setUsernameEmail(String username_email) {
        this.username_email = username_email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
