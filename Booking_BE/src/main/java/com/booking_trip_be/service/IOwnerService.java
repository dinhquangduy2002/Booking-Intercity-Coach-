package com.booking_trip_be.service;

import com.booking_trip_be.entity.Owner;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IOwnerService {
    void save(Owner owner);
    void edit(Owner owner);
    Owner getOwnerByAccount(int idAccount);
    List<Owner> getAll ();
    List<Owner> getAllByStatus(@Param("status") String status);
    Owner findOwnerById(int id);
}
