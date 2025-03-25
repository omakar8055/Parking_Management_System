package com.parking.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "parking_slots")
public class ParkingSlot {
    @Id
    private String id;
    private String slotNumber;
    private SlotStatus status = SlotStatus.AVAILABLE;
    private String bookedBy;
    private String startTime;
    private String endTime;
    private String createdAt;
    private String updatedAt;
    private double hourlyRate = 0.0; // Default hourly rate
    
    public enum SlotStatus {
        AVAILABLE,
        OCCUPIED
    }
}