package com.parking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {
    @NotBlank
    private String username; // Can be either username or email
    
    @NotBlank
    private String password;
}