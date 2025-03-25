package com.parking.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parking.model.GlobalSettings;
import com.parking.model.ParkingSlot;
import com.parking.service.GlobalSettingsService;
import com.parking.service.ParkingSlotService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/settings")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminSettingsController {

    @Autowired
    private GlobalSettingsService globalSettingsService;
    
    @Autowired
    private ParkingSlotService parkingSlotService;
    
    @GetMapping("/global")
    public ResponseEntity<GlobalSettings> getGlobalSettings() {
        GlobalSettings settings = globalSettingsService.getGlobalSettings();
        return ResponseEntity.ok(settings);
    }
    
    @PutMapping("/global")
    public ResponseEntity<GlobalSettings> updateGlobalSettings(@RequestBody GlobalSettings settings) {
        GlobalSettings updatedSettings = globalSettingsService.updateGlobalSettings(settings);
        return ResponseEntity.ok(updatedSettings);
    }
    
    @PutMapping("/parking-slot/{id}/rate")
    public ResponseEntity<?> updateParkingSlotRate(
            @PathVariable("id") String id,
            @RequestBody ParkingSlot parkingSlotDetails) {
        try {
            // Only update the hourly rate
            ParkingSlot updatedSlot = parkingSlotService.updateParkingSlotRate(id, parkingSlotDetails.getHourlyRate());
            return ResponseEntity.ok(updatedSlot);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}