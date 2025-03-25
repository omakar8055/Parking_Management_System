package com.parking.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
import com.parking.service.BookingService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getBookingsByUserId(@PathVariable("userId") String userId) {
        List<Booking> bookings = bookingService.getBookingsByUserId(userId);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/active/user/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getActiveBookingsByUserId(@PathVariable("userId") String userId) {
        List<Booking> bookings = bookingService.getActiveBookingsByUserId(userId);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Booking> getBookingById(@PathVariable("id") String id) {
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        Booking createdBooking = bookingService.createBooking(booking);
        return ResponseEntity.ok(createdBooking);
    }
    
    @PutMapping("/complete/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> completeBooking(@PathVariable("id") String id) {
        try {
            Booking completedBooking = bookingService.completeBooking(id);
            return ResponseEntity.ok(completedBooking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to complete booking. Please try again.");
        }
    }
    
    @PutMapping("/cancel/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> cancelBooking(@PathVariable("id") String id) {
        try {
            Booking cancelledBooking = bookingService.cancelBooking(id);
            return ResponseEntity.ok(cancelledBooking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to cancel booking. Please try again.");
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBooking(@PathVariable("id") String id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/penalties")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getBookingsWithPenalty() {
        List<Booking> bookings = bookingService.getBookingsWithPenalty();
        return ResponseEntity.ok(bookings);
    }
}