package com.parking.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.parking.model.ParkingSlot;
import com.parking.model.ParkingSlot.SlotStatus;
import com.parking.repository.ParkingSlotRepository;

@Service
public class ParkingSlotService {

    @Autowired
    private ParkingSlotRepository parkingSlotRepository;
    
    @Autowired
    private GlobalSettingsService globalSettingsService;
    
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    public List<ParkingSlot> getAllParkingSlots() {
        return parkingSlotRepository.findAll();
    }
    
    public List<ParkingSlot> getAvailableParkingSlots() {
        return parkingSlotRepository.findByStatus(SlotStatus.AVAILABLE);
    }
    
    public Optional<ParkingSlot> getParkingSlotById(String id) {
        return parkingSlotRepository.findById(id);
    }
    
    public ParkingSlot createParkingSlot(ParkingSlot parkingSlot) {
        if (parkingSlotRepository.existsBySlotNumber(parkingSlot.getSlotNumber())) {
            throw new RuntimeException("Slot number already exists");
        }
        
        // If hourly rate is not set, use the default rate from global settings
        if (parkingSlot.getHourlyRate() == 0.0) {
            double defaultHourlyRate = globalSettingsService.getGlobalSettings().getDefaultHourlyRate();
            parkingSlot.setHourlyRate(defaultHourlyRate);
        }
        
        LocalDateTime now = LocalDateTime.now();
        parkingSlot.setCreatedAt(now.format(formatter));
        parkingSlot.setUpdatedAt(now.format(formatter));
        return parkingSlotRepository.save(parkingSlot);
    }
    
    public ParkingSlot updateParkingSlot(String id, ParkingSlot parkingSlotDetails) {
        ParkingSlot parkingSlot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parking slot not found with id: " + id));
        
        parkingSlot.setSlotNumber(parkingSlotDetails.getSlotNumber());
        parkingSlot.setStatus(parkingSlotDetails.getStatus());
        
        // Update hourly rate if provided
        if (parkingSlotDetails.getHourlyRate() > 0) {
            parkingSlot.setHourlyRate(parkingSlotDetails.getHourlyRate());
        }
        
        parkingSlot.setUpdatedAt(LocalDateTime.now().format(formatter));
        
        return parkingSlotRepository.save(parkingSlot);
    }
    
    public void deleteParkingSlot(String id) {
        ParkingSlot parkingSlot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parking slot not found with id: " + id));
        
        parkingSlotRepository.delete(parkingSlot);
    }
    
    public ParkingSlot bookParkingSlot(String id, String userId, String startTime, String endTime) {
        ParkingSlot parkingSlot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parking slot not found with id: " + id));
        
        if (parkingSlot.getStatus() == SlotStatus.OCCUPIED) {
            throw new RuntimeException("Parking slot is already occupied");
        }
        
        parkingSlot.setStatus(SlotStatus.OCCUPIED);
        parkingSlot.setBookedBy(userId);
        parkingSlot.setStartTime(startTime);
        parkingSlot.setEndTime(endTime);
        parkingSlot.setUpdatedAt(LocalDateTime.now().format(formatter));
        
        return parkingSlotRepository.save(parkingSlot);
    }
    
    public ParkingSlot releaseParkingSlot(String id) {
        ParkingSlot parkingSlot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parking slot not found with id: " + id));
        
        parkingSlot.setStatus(SlotStatus.AVAILABLE);
        parkingSlot.setBookedBy(null);
        parkingSlot.setStartTime(null);
        parkingSlot.setEndTime(null);
        parkingSlot.setUpdatedAt(LocalDateTime.now().format(formatter));
        
        return parkingSlotRepository.save(parkingSlot);
    }
    
    /**
     * Update only the hourly rate of a parking slot
     */
    public ParkingSlot updateParkingSlotRate(String id, double hourlyRate) {
        ParkingSlot parkingSlot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parking slot not found with id: " + id));
        
        parkingSlot.setHourlyRate(hourlyRate);
        parkingSlot.setUpdatedAt(LocalDateTime.now().format(formatter));
        
        return parkingSlotRepository.save(parkingSlot);
    }
}