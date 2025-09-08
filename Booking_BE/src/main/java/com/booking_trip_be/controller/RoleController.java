package com.booking_trip_be.controller;

import com.booking_trip_be.entity.Role;
import com.booking_trip_be.service.impl.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@CrossOrigin("*")
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @GetMapping
    private List<Role> getAll() {
        return roleService.findAll();
    }

}