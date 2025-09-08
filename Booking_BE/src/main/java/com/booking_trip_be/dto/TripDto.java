package com.booking_trip_be.dto;

import com.booking_trip_be.entity.Account;
import com.booking_trip_be.entity.Category;

import com.booking_trip_be.entity.Image;
import com.booking_trip_be.entity.Trip;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
public class TripDto {
    private int id;
    private String name;
    private String address;
    private String departure;   // Thêm từ Entity Trip
    private String destination; // Thêm từ Entity Trip
    private String licensePlate; // Thêm từ Entity Trip
    private int seat;           // Thêm từ Entity Trip
    private int seatBooking;    // Thêm từ Entity Trip
    private String description;
    private String driver;      // Thêm từ Entity Trip
    private double price;
    private int sale;
    private double area;
    private String thumbnail;
    private String status;
    private LocalDate createAt;
    private LocalDate departureDate;
    private LocalDate updateAt; // Thêm từ Entity Trip
    private Account owner;
    private Category category;
    private List<Image> images;
    private List<Image> imagesDelete;

    // Nếu bạn muốn một constructor để chuyển đổi từ Entity sang DTO
    public TripDto(Trip trip) {
        this.id = trip.getId();
        this.name = trip.getName();
        this.address = trip.getAddress();
        this.departure = trip.getDeparture();
        this.destination = trip.getDestination();
        this.licensePlate = trip.getLicensePlate();
        this.seat = trip.getSeat();
        this.seatBooking = trip.getSeatBooking();
        this.description = trip.getDescription();
        this.driver = trip.getDriver();
        this.price = trip.getPrice();
        this.sale = trip.getSale();
        this.area = trip.getArea();
        this.thumbnail = trip.getThumbnail();
        this.status = trip.getStatus();
        this.createAt = trip.getCreateAt();
        this.updateAt = trip.getUpdateAt();
        this.owner = trip.getOwner();
        this.category = trip.getCategory();
        this.departureDate = trip.getDepartureDate();
    }
}
