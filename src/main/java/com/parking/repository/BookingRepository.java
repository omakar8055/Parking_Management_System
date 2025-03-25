package com.parking.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.parking.model.Booking;
import com.parking.model.Booking.BookingStatus;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findBySlotId(String slotId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);
}