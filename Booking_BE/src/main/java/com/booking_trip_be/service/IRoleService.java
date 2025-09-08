package com.booking_trip_be.service;

import com.booking_trip_be.entity.Role;

import java.util.List;

public interface IRoleService {
    Role findById(int id);
    List<Role> findAll();
}

