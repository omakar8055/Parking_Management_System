package com.parking.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.parking.model.User;
import com.parking.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public User createUser(User user) {
        // Set default role if not provided
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            Set<String> roles = new HashSet<>();
            roles.add("ROLE_USER");
            user.setRoles(roles);
        }
        
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Set timestamps
        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now.format(DATE_FORMATTER));
        user.setUpdatedAt(now.format(DATE_FORMATTER));
        
        return userRepository.save(user);
    }
    
    public User updateUser(String id, User userDetails) {
        return userRepository.findById(id)
                .map(existingUser -> {
                    // Update fields
                    if (userDetails.getUsername() != null) {
                        existingUser.setUsername(userDetails.getUsername());
                    }
                    
                    if (userDetails.getEmail() != null) {
                        existingUser.setEmail(userDetails.getEmail());
                    }
                    
                    if (userDetails.getPassword() != null) {
                        existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                    }
                    
                    if (userDetails.getRoles() != null && !userDetails.getRoles().isEmpty()) {
                        existingUser.setRoles(userDetails.getRoles());
                    }
                    
                    // Update timestamp
                    existingUser.setUpdatedAt(LocalDateTime.now().format(DATE_FORMATTER));
                    
                    return userRepository.save(existingUser);
                })
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }
    
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
    
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}