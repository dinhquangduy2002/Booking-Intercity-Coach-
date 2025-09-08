package com.booking_trip_be.dto;
import lombok.Data;

import java.time.LocalDateTime;
@Data
public class BookingDto {
    private String tripName;
    private String status;
    private String pickUp;
    private String destination;
    private String time;
}
