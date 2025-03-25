package com.parking.controller;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parking.model.Booking;
import com.parking.model.Booking.BookingStatus;
import com.parking.model.User;
import com.parking.service.BookingService;
import com.parking.service.ParkingSlotService;
import com.parking.service.UserService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private ParkingSlotService parkingSlotService;
    
    @Autowired
    private PasswordEncoder encoder;
    
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@Valid @RequestBody User user) {
        if (userService.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }
        
        if (userService.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }
        
        // Set roles if provided, otherwise default to USER role
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            Set<String> roles = new HashSet<>();
            roles.add("ROLE_USER");
            user.setRoles(roles);
        }
        
        // Encode password
        user.setPassword(encoder.encode(user.getPassword()));
        
        User savedUser = userService.createUser(user);
        return ResponseEntity.ok(savedUser);
    }
    
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @Valid @RequestBody User userDetails) {
        try {
            User updatedUser = userService.updateUser(id, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().body("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting user: " + e.getMessage());
        }
    }
    
    @PostMapping("/create-admin")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> createAdminUser(@Valid @RequestBody User user) {
        if (userService.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }
        
        if (userService.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }
        
        // Set admin role
        Set<String> roles = new HashSet<>();
        roles.add("ROLE_ADMIN");
        user.setRoles(roles);
        
        // Encode password
        user.setPassword(encoder.encode(user.getPassword()));
        
        User savedUser = userService.createUser(user);
        return ResponseEntity.ok(savedUser);
    }
    
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Get user statistics
            List<User> users = userService.getAllUsers();
            stats.put("totalUsers", users.size());
            
            // Get parking slot statistics
            stats.put("totalSlots", parkingSlotService.getAllParkingSlots().size());
            
            // Get booking statistics
            List<Booking> allBookings = bookingService.getAllBookings();
            stats.put("totalBookings", allBookings.size());
            
            // Calculate booking status counts
            long activeBookings = allBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.ACTIVE)
                    .count();
            
            long completedBookings = allBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                    .count();
            
            long cancelledBookings = allBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                    .count();
            
            // Get bookings with penalties
            List<Booking> penaltyBookings = bookingService.getBookingsWithPenalty();
            
            stats.put("activeBookings", activeBookings);
            stats.put("completedBookings", completedBookings);
            stats.put("cancelledBookings", cancelledBookings);
            stats.put("bookingsWithPenalty", penaltyBookings.size());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching dashboard data: " + e.getMessage());
        }
    }
}