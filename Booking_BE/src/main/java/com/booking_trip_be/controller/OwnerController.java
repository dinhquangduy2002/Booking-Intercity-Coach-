package com.booking_trip_be.controller;

import com.booking_trip_be.dto.TripDto;
import com.booking_trip_be.entity.Booking;
import com.booking_trip_be.entity.Trip;
import com.booking_trip_be.service.IBookingService;
import com.booking_trip_be.service.ITripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/api/owners")
public class OwnerController {
    @Autowired
    private ITripService tripService;
    @Autowired
    IBookingService bookingService;

    @PostMapping("/create-trip")
    public ResponseEntity<?> createTrips(@RequestBody TripDto tripDto) {
        try {
            Trip trip = tripService.createTrip(tripDto);
            if (trip == null)
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Create trip fail!");
            else
                return ResponseEntity.ok(trip);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }

    @PostMapping("/edit-trip")
    public ResponseEntity<?> editTrips(@RequestBody TripDto tripDto) {
        try {
            Trip trip = tripService.editTrip(tripDto);
            if (trip == null)
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Edit trip fail!");
            else
                return ResponseEntity.ok(trip);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }

    @PostMapping("/cancel-booking/{id}")
    public ResponseEntity<?> cancelBookingOwner(@PathVariable int id, @RequestBody Map<String, String> requestBody) {
        try {
            String message = requestBody.get("message");
            Booking booking = bookingService.findById(id);
            String toEmail = booking.getAccount().getEmail();
            String contentTitle = "Nhà xe đã hủy lịch";
            bookingService.cancelBooking(booking, toEmail, contentTitle, message);
            return ResponseEntity.ok("Hủy thành công");
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }
}
