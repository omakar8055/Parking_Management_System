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

import com.parking.model.ParkingSlot;
import com.parking.service.ParkingSlotService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/parking-slots")
public class ParkingSlotController {

    @Autowired
    private ParkingSlotService parkingSlotService;

    @GetMapping
    public ResponseEntity<List<ParkingSlot>> getAllParkingSlots() {
        List<ParkingSlot> parkingSlots = parkingSlotService.getAllParkingSlots();
        return ResponseEntity.ok(parkingSlots);
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<ParkingSlot>> getAvailableParkingSlots() {
        List<ParkingSlot> parkingSlots = parkingSlotService.getAvailableParkingSlots();
        return ResponseEntity.ok(parkingSlots);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ParkingSlot> getParkingSlotById(@PathVariable("id") String id) {
        return parkingSlotService.getParkingSlotById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParkingSlot> createParkingSlot(@RequestBody ParkingSlot parkingSlot) {
        ParkingSlot createdSlot = parkingSlotService.createParkingSlot(parkingSlot);
        return ResponseEntity.ok(createdSlot);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParkingSlot> updateParkingSlot(
            @PathVariable("id") String id,
            @RequestBody ParkingSlot parkingSlot) {
        ParkingSlot updatedSlot = parkingSlotService.updateParkingSlot(id, parkingSlot);
        return ResponseEntity.ok(updatedSlot);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteParkingSlot(@PathVariable("id") String id) {
        parkingSlotService.deleteParkingSlot(id);
        return ResponseEntity.noContent().build();
    }
}