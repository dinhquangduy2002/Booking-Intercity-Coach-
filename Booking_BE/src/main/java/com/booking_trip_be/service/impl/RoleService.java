package com.booking_trip_be.service.impl;

import com.booking_trip_be.entity.Role;
import com.booking_trip_be.repository.IRoleRepo;
import com.booking_trip_be.service.IRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService implements IRoleService {
    @Autowired
    IRoleRepo iRoleRepo ;

    @Override
    public Role findById(int id) {
        return iRoleRepo.findById(id);
    }

    @Override
    public List<Role> findAll() {
        return iRoleRepo.findAll();
    }
}

