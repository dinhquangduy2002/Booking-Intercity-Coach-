package com.booking_trip_be.service;

import com.booking_trip_be.entity.Image;

import java.util.List;

public interface IImageService {
    List<Image> findAllByTripId(int id);
}
