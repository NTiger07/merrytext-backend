package com.favour.merrytext.config;

import java.time.LocalDateTime;

public class APIConfig<T> {
    private String status;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    public APIConfig(String status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and setters
    public String getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
