package com.parking.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.parking.model.ParkingSlot;
import com.parking.model.ParkingSlot.SlotStatus;

public interface ParkingSlotRepository extends MongoRepository<ParkingSlot, String> {
    List<ParkingSlot> findByStatus(SlotStatus status);
    Boolean existsBySlotNumber(String slotNumber);
}