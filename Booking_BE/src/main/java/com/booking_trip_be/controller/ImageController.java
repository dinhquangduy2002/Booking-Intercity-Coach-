package com.booking_trip_be.controller;

import com.booking_trip_be.service.IImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/api/images")
public class ImageController {
    @Autowired
    private IImageService imageService;

    @GetMapping("/trip/{id}")
    public ResponseEntity<?> getById(@PathVariable int id){
        try{
            return ResponseEntity.ok(imageService.findAllByTripId(id));
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }
}
