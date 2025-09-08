package com.booking_trip_be.service.impl;

import com.booking_trip_be.entity.Owner;
import com.booking_trip_be.repository.IOwnerRepo;
import com.booking_trip_be.service.IOwnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OwnerService implements IOwnerService {
    @Autowired
    IOwnerRepo ownerRepo;
    @Override
    public void save(Owner owner) {
        ownerRepo.save(owner);
    }
    @Override
    public void edit(Owner owner) {
        ownerRepo.save(owner);
    }

    @Override
    public Owner getOwnerByAccount(int idAccount) {
        return ownerRepo.getOwnerByAccount(idAccount);
    }
    @Override
    public List<Owner> getAll() {
        return ownerRepo.findAll();
    }

    @Override
    public List<Owner> getAllByStatus(String status) {
        return ownerRepo.getAllByStatus(status);
    }

    @Override
    public Owner findOwnerById(int id) {
        return ownerRepo.findOwnerById(id);
    }
}
