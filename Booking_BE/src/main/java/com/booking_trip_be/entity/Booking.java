package com.booking_trip_be.entity;
import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private double total;
    private int quantity;
    private String pickUp;
    private String destination;
    private String time;
    private String status;
    private LocalDateTime create_at;
    @ManyToOne
    private Trip trip;
    @ManyToOne
    private Account account;
}
