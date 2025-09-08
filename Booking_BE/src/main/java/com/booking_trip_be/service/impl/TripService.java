package com.booking_trip_be.service.impl;

import com.booking_trip_be.dto.TripDto;
import com.booking_trip_be.entity.Trip;
import com.booking_trip_be.entity.Image;
import com.booking_trip_be.repository.IBookingRepo;
import com.booking_trip_be.repository.ITripRepo;
import com.booking_trip_be.repository.IImageRepo;
import com.booking_trip_be.service.ITripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TripService implements ITripService {
    @Autowired
    private ITripRepo tripRepo;
    @Autowired
    private IImageRepo imageRepo;
    @Autowired
    private IBookingRepo bookingRepo;
    @Autowired
    private IBookingRepo iBookingRepo;

    @Override
    public Trip findById(int id) {
        return tripRepo.findById(id).get();
    }

    @Override
    public Trip createTrip(TripDto tripDto) {
        Trip trip = new Trip(tripDto);
        trip.setStatus("Sắp khởi hành");
        trip.setCreateAt(LocalDate.now());
        Trip tripDB = tripRepo.save(trip);
        List<Image> imageList = tripDto.getImages();
        for (Image image : tripDto.getImages()) {
            image.setTrip(tripDB);
        }
        imageRepo.saveAll(imageList);
        return tripDB;
    }

    @Override
    public Trip editTrip(TripDto tripDto) {
        imageRepo.saveAll(tripDto.getImages());
        imageRepo.deleteAll(tripDto.getImagesDelete());
        Trip trip = new Trip(tripDto);
        trip.setUpdateAt(LocalDate.now());
        return tripRepo.save(trip);
    }

    @Override
    public Trip saveTrip(Trip trip) {
        return tripRepo.save(trip);
    }

    public Trip updateStatus(int id, String status) {
        Trip trip = tripRepo.findById(id).orElse(null);
        if (trip != null) {
            if (status.equals("Đã hủy") || status.equals("Đang bảo trì")){
                if (!iBookingRepo.findAllByTripId(trip.getId()).isEmpty()) {
                    return null;
                }
            }
            trip.setStatus(status);
            return tripRepo.save(trip);
        }
        return null;
    }

    @Override
    public List<Integer> getTopBookingTripId() {
        return tripRepo.getTopBookingTripId();
    }

    @Override
    public Page<Trip> findByOwnerIdAndNameAndStatus(int id, String name, String status, Pageable pageable) {
        return tripRepo.findByOwnerIdAndNameAndStatus( id, name, status, pageable);
    }

    @Override
    public List<Trip> findByOwnerId(int ownerId) {
        return tripRepo.findAllByOwnerId(ownerId);
    }

    @Override
    public Page<Trip> findByOwnerId(int ownerId, Pageable pageable) {
        return tripRepo.findByOwnerId(ownerId, pageable);
    }


    @Override
    public Trip findByIdAndOwnerId(int TripId, int ownerId) {
        return tripRepo.findByIdAndOwnerId(TripId, ownerId);
    }

}
