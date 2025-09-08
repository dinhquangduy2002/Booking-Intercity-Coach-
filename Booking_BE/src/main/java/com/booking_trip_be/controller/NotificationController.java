package com.booking_trip_be.controller;

import com.booking_trip_be.entity.Notification;
import com.booking_trip_be.service.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    private INotificationService notificationService;

    @GetMapping("/count-unread/{accountId}")
    public int countUnreadNotifyByAccountLoginId(@PathVariable int accountId) {
        try {
            return notificationService.countUnreadNotifyByAccountLoginId(accountId);
        } catch (Exception e) {
            return 0;
        }
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<?> findAllByReceiverId(@PathVariable int accountId) {
        try {
            return ResponseEntity.ok(notificationService.findAllByReceiverId(accountId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }

    @PutMapping("/change-status/{accountId}")
    public ResponseEntity<?> changeStatusNotify(@PathVariable int accountId) {
        try {
            notificationService.changeStatusNotify(accountId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> saveNotify(@RequestBody Notification notification) {
        try {
            return ResponseEntity.ok(notificationService.save(notification));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }
}
