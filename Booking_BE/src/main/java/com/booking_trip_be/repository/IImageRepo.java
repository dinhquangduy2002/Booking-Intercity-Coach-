package com.booking_trip_be.repository;
import com.booking_trip_be.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IImageRepo extends JpaRepository<Image, Integer> {
    List<Image> findAllByTripId(int id);
}
