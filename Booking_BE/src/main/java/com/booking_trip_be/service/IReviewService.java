package com.booking_trip_be.service;

import com.booking_trip_be.entity.Review;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IReviewService {
    Page<Review> findAllByTripId(int id, int page, int size);
    Double avgRating(int id);
    List<Review> findAllByAccountId(int accountId);
}
