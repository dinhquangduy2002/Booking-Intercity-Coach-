package com.booking_trip_be;

import com.booking_trip_be.service.impl.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class BookingBeApplication {
    @Autowired
    private EmailService emailService;

    public static void main(String[] args) {
        SpringApplication.run(BookingBeApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void sendEmail() {
        emailService.sendEmail("huhuh8918@gmail.com", "aaa", "aaa");
    }
}
