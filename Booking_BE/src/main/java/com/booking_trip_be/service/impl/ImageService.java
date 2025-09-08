package com.booking_trip_be.service.impl;

import com.booking_trip_be.entity.Image;
import com.booking_trip_be.repository.IImageRepo;
import com.booking_trip_be.service.IImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ImageService implements IImageService {
    @Autowired
    private IImageRepo imageRepo;
    @Override
    public List<Image> findAllByTripId(int id) {
        return imageRepo.findAllByTripId(id);
    }
}
