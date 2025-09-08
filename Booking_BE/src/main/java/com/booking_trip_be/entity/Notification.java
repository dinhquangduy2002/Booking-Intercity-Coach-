package com.booking_trip_be.entity;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;


@Entity
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private LocalDateTime createAt;
    private String message;
    private String navigate;
    private boolean status;
    @ManyToOne
    private Account sender;
    @ManyToOne
    private Account receiver;
}
