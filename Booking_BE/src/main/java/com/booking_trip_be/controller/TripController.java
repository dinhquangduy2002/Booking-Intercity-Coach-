package com.booking_trip_be.controller;

import com.booking_trip_be.entity.Trip;
import com.booking_trip_be.repository.ITripRepo;
import com.booking_trip_be.service.ITripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;


@RestController
@CrossOrigin("*")
@RequestMapping("/api/trips")
public class TripController {
    @Autowired
    private ITripService Tripervice;

    @Autowired
    private ITripRepo iTripRepo;

    @GetMapping("/search")
    public Page<Trip> searchTrips(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "12") int size,
            @RequestParam(value = "departure", defaultValue = "") String departure,
            @RequestParam(value = "destination", defaultValue = "") String destination,
            @RequestParam(value = "departureDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate departureDate,
            @RequestParam(value = "idCate", defaultValue = "0") int idCate) {

        Pageable pageable = PageRequest.of(page, size);

        // Xử lý trường hợp không truyền departureDate
        if (departureDate == null) {
            return iTripRepo.findTripsWithoutDate(departure, destination, idCate, pageable);
        }
        Date utilDate = java.sql.Date.valueOf(departureDate); // chuyển LocalDate → java.util.Date

        return iTripRepo.findTripsWithDate(departure, destination, utilDate, idCate, pageable);
    }


    @GetMapping("/{tripId}")
    public ResponseEntity<?> getById(@PathVariable int tripId) {
        try {
            return ResponseEntity.ok(Tripervice.findById(tripId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }

    @GetMapping("/{tripId}/{ownerId}")
    public ResponseEntity<?> getById(@PathVariable int tripId, @PathVariable int ownerId) {
        try {
            return ResponseEntity.ok(Tripervice.findByIdAndOwnerId(tripId, ownerId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }


    @GetMapping("/owner/search/{ownerId}")
    public Page<Trip> findByOwnerIdAndNameContains(@PathVariable int ownerId,
                                                                 @RequestParam("name") String name,
                                                                 @RequestParam("status") String status,
                                                                 @RequestParam(value = "page", defaultValue = "0") int page,
                                                                 @RequestParam(value = "size", defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        if (name.equals("")){
            name = null;
        }
        if (status.equals("")){
            status = null;
        }
        return Tripervice.findByOwnerIdAndNameAndStatus(ownerId, name, status, pageable);
    }

    @GetMapping("/owner/revenue/{ownerId}")
    public List<Trip> findByOwnerId(@PathVariable int ownerId) {
        return Tripervice.findByOwnerId(ownerId);
    }

    @GetMapping("/owner/listTrip/{ownerId}")
    public Page<Trip> findByOwnerIdAndNameContains(@PathVariable int ownerId,
                                                   @RequestParam(value = "page", defaultValue = "0") int page,
                                                   @RequestParam(value = "size", defaultValue = "5") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return Tripervice.findByOwnerId(ownerId, pageable);
    }

    @PutMapping("/owner/{tripId}")
    public Trip updateStageStatus(@PathVariable int tripId, @RequestParam("status") String status) {
        Trip trip = Tripervice.updateStatus(tripId, status);
        if (trip == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found");
        }
        return trip;
    }

    @GetMapping("/top5")
    public List<Trip> getTopBookingtrip() {
        List<Integer> tripId = Tripervice.getTopBookingTripId();
        List<Trip> trips = new ArrayList<>();
        for (int i = 0; i < tripId.size(); i++) {
            trips.add(Tripervice.findById(tripId.get(i)));
            if (i == 5) break;
        }
        return trips;
    }

}