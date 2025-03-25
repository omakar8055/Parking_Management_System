package com.parking.service;

import java.time.LocalDateTime;
import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.parking.model.Booking;
import com.parking.model.Booking.BookingStatus;
import com.parking.model.ParkingSlot;
import com.parking.repository.BookingRepository;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private ParkingSlotService parkingSlotService;
    
    @Autowired
    private GlobalSettingsService globalSettingsService;
    
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    
    public List<Booking> getBookingsByUserId(String userId) {
        return bookingRepository.findByUserId(userId);
    }
    
    public List<Booking> getActiveBookingsByUserId(String userId) {
        return bookingRepository.findByUserIdAndStatus(userId, BookingStatus.ACTIVE);
    }
    
    public Optional<Booking> getBookingById(String id) {
        return bookingRepository.findById(id);
    }
    
    public Booking createBooking(Booking booking) {
        // Format dates properly if they don't include seconds
        String startTime = formatDateTimeIfNeeded(booking.getStartTime());
        String endTime = formatDateTimeIfNeeded(booking.getEndTime());
        
        // Update booking with properly formatted dates
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        
        // Get the parking slot to access its hourly rate
        ParkingSlot parkingSlot = parkingSlotService.getParkingSlotById(booking.getSlotId())
                .orElseThrow(() -> new RuntimeException("Parking slot not found with id: " + booking.getSlotId()));
        
        // Calculate booking amount based on duration and hourly rate
        LocalDateTime startDateTime = LocalDateTime.parse(startTime, formatter);
        LocalDateTime endDateTime = LocalDateTime.parse(endTime, formatter);
        
        // Calculate duration in hours (rounded up to the nearest hour)
        Duration duration = Duration.between(startDateTime, endDateTime);
        long hours = duration.toHours();
        if (duration.toMinutesPart() > 0) {
            hours++; // Round up to the next hour if there are additional minutes
        }
        
        // Calculate booking amount
        double bookingAmount = hours * parkingSlot.getHourlyRate();
        booking.setBookingAmount(bookingAmount);
        booking.setTotalAmount(bookingAmount); // Initially total amount is same as booking amount
        
        // Book the parking slot
        parkingSlot = parkingSlotService.bookParkingSlot(
                booking.getSlotId(), 
                booking.getUserId(), 
                startTime, 
                endTime);
        
        LocalDateTime now = LocalDateTime.now();
        booking.setCreatedAt(now.format(formatter));
        booking.setUpdatedAt(now.format(formatter));
        booking.setStatus(BookingStatus.ACTIVE);
        
        return bookingRepository.save(booking);
    }
    
    public Booking completeBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        
        if (booking.getStatus() != BookingStatus.ACTIVE) {
            throw new RuntimeException("Booking is not active");
        }
        
        // Get the parking slot to access its hourly rate
        ParkingSlot parkingSlot = parkingSlotService.getParkingSlotById(booking.getSlotId())
                .orElseThrow(() -> new RuntimeException("Parking slot not found with id: " + booking.getSlotId()));
        
        // Check if booking has ended and apply penalty if needed
        String formattedEndTime = formatDateTimeIfNeeded(booking.getEndTime());
        LocalDateTime endTime = LocalDateTime.parse(formattedEndTime, formatter);
        LocalDateTime now = LocalDateTime.now();
        
        if (now.isAfter(endTime)) {
            booking.setPenalty(true);
            
            // Calculate penalty based on hours exceeded and hourly rate
            Duration exceededDuration = Duration.between(endTime, now);
            long exceededHours = exceededDuration.toHours();
            if (exceededDuration.toMinutesPart() > 0) {
                exceededHours++; // Round up to the next hour if there are additional minutes
            }
            
            // Get the default penalty amount from global settings
            double defaultPenaltyAmount = globalSettingsService.getGlobalSettings().getDefaultPenaltyAmount();
            
            // Apply penalty as default penalty amount plus hourly rate for each exceeded hour
            double penaltyAmount = defaultPenaltyAmount + (exceededHours * parkingSlot.getHourlyRate());
            booking.setPenaltyAmount(penaltyAmount);
            
            // Update total amount to include penalty
            booking.setTotalAmount(booking.getBookingAmount() + penaltyAmount);
        } else {
            // No penalty, total amount is just the booking amount
            booking.setTotalAmount(booking.getBookingAmount());
        }
        
        // Release the parking slot
        parkingSlotService.releaseParkingSlot(booking.getSlotId());
        
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setUpdatedAt(now.format(formatter));
        
        return bookingRepository.save(booking);
    }
    
    public Booking cancelBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        
        if (booking.getStatus() != BookingStatus.ACTIVE) {
            throw new RuntimeException("Booking is not active");
        }
        
        // Release the parking slot
        parkingSlotService.releaseParkingSlot(booking.getSlotId());
        
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now().format(formatter));
        
        return bookingRepository.save(booking);
    }
    
    public void deleteBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        
        if (booking.getStatus() == BookingStatus.ACTIVE) {
            // Release the parking slot if booking is active
            parkingSlotService.releaseParkingSlot(booking.getSlotId());
        }
        
        bookingRepository.delete(booking);
    }
    
    public List<Booking> getBookingsWithPenalty() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .filter(Booking::isPenalty)
                .collect(Collectors.toList());
    }
    
    /**
     * Helper method to format datetime strings if they don't include seconds
     * Handles the format from frontend (yyyy-MM-ddTHH:mm) and converts to backend format (yyyy-MM-dd HH:mm:ss)
     */
    private String formatDateTimeIfNeeded(String dateTimeStr) {
        if (dateTimeStr == null) {
            return null;
        }
        
        // Check if the datetime string contains 'T' (from the HTML datetime-local input)
        if (dateTimeStr.contains("T")) {
            // Replace 'T' with space
            dateTimeStr = dateTimeStr.replace("T", " ");
            
            // Check if seconds are missing (if string ends with minutes HH:mm)
            if (dateTimeStr.length() == 16) { // Format: yyyy-MM-dd HH:mm
                dateTimeStr = dateTimeStr + ":00"; // Add seconds
            }
        }
        
        return dateTimeStr;
    }
}