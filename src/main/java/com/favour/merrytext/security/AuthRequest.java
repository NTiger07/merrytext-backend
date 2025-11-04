package com.favour.merrytext.security;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthRequest {
    @JsonProperty("username_email")
    private String usernameEmail;
    private String password;

    public AuthRequest() {
    }

    public AuthRequest(String usernameEmail, String password) {
        this.usernameEmail = usernameEmail;
        this.password = password;
    }

    public String getUsernameEmail() {
        return usernameEmail;
    }

    public void setUsernameEmail(String usernameEmail) {
        this.usernameEmail = usernameEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
