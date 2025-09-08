package com.booking_trip_be.service;

import com.booking_trip_be.dto.TripDto;
import com.booking_trip_be.entity.Trip;
import com.booking_trip_be.repository.ITripRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ITripService {
    Trip findById(int id);

    Trip createTrip(TripDto tripDto);

    Page<Trip> findByOwnerIdAndNameAndStatus(int id, String name, String status, Pageable pageable);

    List<Trip> findByOwnerId(int ownerId);

    Page<Trip> findByOwnerId(int ownerId, Pageable pageable);

    Trip editTrip(TripDto tripDto);

    Trip saveTrip(Trip trip);

    Trip findByIdAndOwnerId(int TripId, int ownerId);

    Trip updateStatus(int id, String status);

    List<Integer> getTopBookingTripId();


}
