package com.booking_trip_be.repository;
import com.booking_trip_be.entity.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IOwnerRepo extends JpaRepository<Owner, Integer> {
    @Query(nativeQuery = true, value = "SELECT * FROM owner where account_id= :idAccount")
    Owner getOwnerByAccount(@Param("idAccount") int idAccount);

    @Query(nativeQuery = true, value = "SELECT * FROM owner where status= :status")
    List<Owner> getAllByStatus(@Param("status") String status);

    Owner findOwnerById(int id);
}
