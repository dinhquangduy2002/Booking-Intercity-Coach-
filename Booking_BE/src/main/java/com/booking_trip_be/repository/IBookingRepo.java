package com.booking_trip_be.repository;

import com.booking_trip_be.dto.query.SpendingDto;
import com.booking_trip_be.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;;

public interface IBookingRepo extends JpaRepository<Booking, Integer> {
    @Query(nativeQuery = true, value = "select * from booking where account_id= :idAccount")
    Page<Booking> getByIdAccount(Pageable pageable, @Param("idAccount") int idAccount);

    @Query("SELECT b from Booking b WHERE b.trip.id = :tripId AND b.status IN ('Chờ xác nhận', 'Chờ nhận vé')")
    List<Booking> findAllBytripIdAndStatus(@Param("tripId") int tripId);

    List<Booking> findAllByTripId(int id);

    Booking findById(int id);

    // ❌ Đoạn này dùng start_time và end_time => Cần xóa hoặc sửa lại nếu có cột khác phù hợp
    @Query(nativeQuery = true, value =
            "SELECT DAY(b.create_at) AS day, " +
                    "SUM(CASE WHEN b.status = 'Đã hoàn thành' THEN b.total ELSE 0 END) AS revenue " +
                    "FROM booking b " +
                    "LEFT JOIN trip h ON h.id = b.trip_id " +
                    "WHERE YEAR(b.create_at) = :year AND " +
                    "MONTH(b.create_at) = :month AND h.owner_id = :ownerId AND " +
                    "DAY(b.create_at) BETWEEN :startDay AND :endDay " +
                    "GROUP BY DAY(b.create_at)")
    List<Object[]> getDailyRevenueByOwnerAndWeek(
            @Param("ownerId") int ownerId,
            @Param("month") int month,
            @Param("year") int year,
            @Param("startDay") int startDay,
            @Param("endDay") int endDay);

    // ❌ startTime/endTime không còn => chỉ dùng create_at
    @Query("SELECT b FROM Booking b " +
            "JOIN Trip h ON h.id = b.trip.id " +
            "WHERE (:nameSearch IS NULL OR h.name LIKE CONCAT('%', :nameSearch, '%')) " +
            "AND (:status IS NULL OR b.status LIKE CONCAT('%', :status, '%')) " +
            "AND (:startTime IS NULL OR b.create_at >= :startTime) " +
            "AND (:endTime IS NULL OR b.create_at <= :endTime) " +
            "AND h.owner.id = :ownerId")
    Page<Booking> findBytripAndStartTimeAndEndTimeAndStatus(
            @Param("ownerId") int ownerId,
            @Param("nameSearch") String nameSearch,
            @Param("status") String status,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );

    @Query(nativeQuery = true, value = "SELECT SUM(b.total) AS spending " +
            "FROM booking b WHERE status = 'Đã hoàn thành' AND b.account_id = :idAccount")
    SpendingDto getSpendingUser(@Param("idAccount") int idAccount);

    @Query(value = "SELECT * FROM booking b " +
            "JOIN trip h ON h.id = b.trip_id " +
            "WHERE (:tripName IS NULL OR h.name LIKE CONCAT('%', :tripName, '%')) " +
            "AND (:status IS NULL OR b.status LIKE CONCAT('%', :status, '%')) " +
            "AND b.account_id = :idAccount", nativeQuery = true)
    Page<Booking> getHistoryRentalByIdAccount(Pageable pageable,
                                              @Param("idAccount") int idAccount,
                                              @Param("tripName") String tripName,
                                              @Param("status") String status);
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.account.id = :idAccount AND b.status IN ('Chờ nhận vé', 'Đã khởi hành', 'Chờ xác nhận')")
    int countCurrentActiveBookings(@Param("idAccount") int idAccount);


}
