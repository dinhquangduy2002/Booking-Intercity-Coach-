package com.booking_trip_be.entity;

import com.booking_trip_be.dto.TripDto;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
public class Trip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private String address;
    private String departure;
    private String destination;
    private String licensePlate;
    private int seat;
    private int seatBooking;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(columnDefinition = "TEXT")
    private String driver;
    private double price;
    private int sale;
    private double area;
    @Column(columnDefinition = "TEXT")
    private String thumbnail;
    private String status;
    private LocalDate createAt;
    private LocalDate departureDate;
    private LocalDate updateAt;
    @ManyToOne
    private Account owner;
    @ManyToOne
    private Category category;

    public Trip(TripDto tripDto){
        this.id = tripDto.getId(); // Chỉ set nếu đây là trường hợp cập nhật
        this.name = tripDto.getName();
        this.address = tripDto.getAddress();
        this.departure = tripDto.getDeparture();
        this.destination = tripDto.getDestination();
        this.licensePlate = tripDto.getLicensePlate();
        this.seat = tripDto.getSeat();
        this.description = tripDto.getDescription();
        this.driver = tripDto.getDriver();
        this.price = tripDto.getPrice();
        this.sale = tripDto.getSale();
        this.area = tripDto.getArea();
        this.thumbnail = tripDto.getThumbnail();
        this.status = tripDto.getStatus();
         this.updateAt = LocalDate.now();
        this.owner = tripDto.getOwner();
        this.category = tripDto.getCategory();
        this.departureDate = tripDto.getDepartureDate();
    }
}