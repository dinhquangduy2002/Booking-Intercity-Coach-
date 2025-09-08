package com.booking_trip_be.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;


@Entity
@Data
@NoArgsConstructor
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String url;
    @ManyToOne
    private Trip trip;
    public Image(String url, Trip trip){
        this.url = url;
        this.trip = trip;
    }

    public Image(int id, String url){
        this.url = url;
        this.id = id;
    }
}
