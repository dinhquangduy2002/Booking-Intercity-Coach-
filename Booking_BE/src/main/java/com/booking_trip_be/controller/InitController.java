package com.booking_trip_be.controller;

import com.booking_trip_be.service.IInitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/init")
public class InitController {
    @Autowired
    private IInitService initService;

    @GetMapping
    public ResponseEntity<?> initData(){
        try {
            initService.initData();
            return ResponseEntity.ok("Insert data successfully");
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }
}
