package com.booking_trip_be.service.impl;

import com.booking_trip_be.entity.Review;
import com.booking_trip_be.repository.IReviewRepo;
import com.booking_trip_be.service.IReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService implements IReviewService {
    @Autowired
    private IReviewRepo reviewRepo;

    @Override
    public Page<Review> findAllByTripId(int id, int page, int size) {
        return reviewRepo.findAllByTripId(id, PageRequest.of(page, size, Sort.by("createAt").descending()));
    }

    @Override
    public Double avgRating(int id) {
        Double avg = reviewRepo.avgRating(id);
        return avg == null ? 0.0 : Math.round(avg * 10) / 10.0;
    }

    @Override
    public List<Review> findAllByAccountId(int accountId) {
        return reviewRepo.findAllByAccountId(accountId);
    }
}
