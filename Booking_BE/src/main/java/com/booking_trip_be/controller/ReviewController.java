package com.booking_trip_be.controller;

import com.booking_trip_be.service.IReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/api/reviews")
public class ReviewController {
    @Autowired
    private IReviewService reviewService;

    @GetMapping("/trip/{id}")
    public ResponseEntity<?> findAllByTripId(@PathVariable int id,
                                              @RequestParam(name = "page", defaultValue = "0") int page,
                                              @RequestParam(name = "size", defaultValue = "5") int size) {
        try {
            return ResponseEntity.ok(reviewService.findAllByTripId(id, page, size));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }

    @GetMapping("/avg-rating/{id}")
    public Double avgRating(@PathVariable int id){
        return reviewService.avgRating(id);
    }

    @GetMapping("/accounts/{accountId}")
    public ResponseEntity<?> findAllByAccountId(@PathVariable int accountId) {
        try {
            return ResponseEntity.ok(reviewService.findAllByAccountId(accountId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }
}
