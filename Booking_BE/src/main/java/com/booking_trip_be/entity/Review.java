package com.booking_trip_be.entity;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDate;


@Entity
@Data
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String comment;
    private String status;
    private int rating;
    private LocalDate createAt;
    @ManyToOne
    private Booking booking;
}
