package com.booking_trip_be.repository;

import com.booking_trip_be.entity.Trip;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;


public interface ITripRepo extends JpaRepository<Trip, Integer> {

    Page<Trip> findByOwnerId(Integer id, Pageable pageable);
    @Query("SELECT t FROM Trip t WHERE t.owner.id = :ownerId " +
            "AND (:name IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (:status IS NULL OR t.status = :status)")
    Page<Trip> findByOwnerIdAndNameAndStatus(
            @Param("ownerId") Integer ownerId,
            @Param("name") String name,
            @Param("status") String status,
            Pageable pageable);


    @Query("SELECT t FROM Trip t WHERE t.owner.id = :ownerId " +
            "AND (:name IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%')))")
    Page<Trip> findByOwnerIdAndName(@Param("ownerId") Integer ownerId, @Param("name") String name, Pageable pageable);

    List<Trip> findAllByOwnerId(int ownerId);


    @Query("SELECT t FROM Trip t " +
            "WHERE LOWER(t.departure) LIKE LOWER(CONCAT('%', :departure, '%')) " +
            "AND LOWER(t.destination) LIKE LOWER(CONCAT('%', :destination, '%')) " +
            "AND t.status='Sắp khởi hành' " +
            "AND (:idCate = 0 OR t.category.id = :idCate)")
    Page<Trip> findTripsWithoutDate(@Param("departure") String departure,
                                    @Param("destination") String destination,
                                    @Param("idCate") int idCate,
                                    Pageable pageable);

    @Query("SELECT t FROM Trip t " +
            "WHERE LOWER(t.departure) LIKE LOWER(CONCAT('%', :departure, '%')) " +
            "AND LOWER(t.destination) LIKE LOWER(CONCAT('%', :destination, '%')) " +
            "AND FUNCTION('DATE', t.departureDate) = :departureDate " +
            "AND t.status='Sắp khởi hành' " +
            "AND (:idCate = 0 OR t.category.id = :idCate)")
    Page<Trip> findTripsWithDate(@Param("departure") String departure,
                                 @Param("destination") String destination,
                                 @Param("departureDate") Date departureDate,
                                 @Param("idCate") int idCate,
                                 Pageable pageable);


    interface TripInfo {
        int getId();

        String getName();

        String getThumbnail();

        double getPrice();

        String getAddress();

        String getProvince();

        double getRevenue();

        String getStatus();
    }


//    @Query("SELECT h FROM Trip h WHERE h.province LIKE concat('%', :province, '%') AND h.district LIKE concat('%', :district, '%') AND (h.category.id = :idCate or :idCate = 0) AND h.name LIKE concat('%', :nameSearch, '%') AND (h.price - h.price * h.sale / 100) BETWEEN :minPrice AND :maxPrice")
//    Page<Trip> findTripsByNameAndPriceRangeAndLocal(Pageable pageable, @Param("nameSearch") String nameSearch, @Param("province") String province, @Param("minPrice") double minPrice, @Param("maxPrice") double maxPrice, @Param("idCate") int idCate, @Param("district") String district);

    @Query("SELECT h FROM Trip h WHERE (h.price - h.price * h.sale / 100)  BETWEEN :minPrice AND :maxPrice")
    Page<Trip> findAllByPriceRange(Pageable pageable, @Param("minPrice") double minPrice, @Param("maxPrice") double maxPrice);

    @Query("SELECT h FROM Trip h WHERE h.name LIKE concat('%', :nameSearch, '%') AND (h.price - h.price * h.sale / 100) BETWEEN :minPrice AND :maxPrice")
    Page<Trip> findTripsByNameAndPriceRange(Pageable pageable, @Param("nameSearch") String nameSearch, @Param("minPrice") double minPrice, @Param("maxPrice") double maxPrice);

    @Query("SELECT h FROM Trip h WHERE h.name LIKE concat('%', :nameSearch, '%') AND h.category.id = :idCate AND (h.price - h.price * h.sale / 100) BETWEEN :minPrice AND :maxPrice")
    Page<Trip> findTripsByNameAndPriceRangeAndCate(Pageable pageable, @Param("nameSearch") String nameSearch, @Param("minPrice") double minPrice, @Param("maxPrice") double maxPrice, @Param("idCate") int idCate);


    Trip findByIdAndOwnerId(int TripId, int ownerId);

    @Query("SELECT b.trip.id, COUNT(*) FROM Booking b GROUP BY b.trip.id ORDER BY COUNT(*) DESC")
    List<Integer> getTopBookingTripId();
}


