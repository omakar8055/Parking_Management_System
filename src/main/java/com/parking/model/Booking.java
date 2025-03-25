package com.parking.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;
    private String userId;
    private String slotId;
    private String startTime;
    private String endTime;
    private BookingStatus status = BookingStatus.ACTIVE;
    private boolean penalty = false;
    private double penaltyAmount = 0.0;
    private double bookingAmount = 0.0; // Amount for the booking based on hourly rate and duration
    private double totalAmount = 0.0;   // Total amount including penalties
    private String createdAt;
    private String updatedAt;
    
    public enum BookingStatus {
        ACTIVE,
        COMPLETED,
        CANCELLED
    }
}