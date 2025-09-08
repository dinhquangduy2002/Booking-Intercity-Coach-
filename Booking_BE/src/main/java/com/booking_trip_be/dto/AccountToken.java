package com.booking_trip_be.dto;

import com.booking_trip_be.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AccountToken {
    private int id;
    private String username;
    private String token;
    private String firstname;
    private String lastname;
    private String address;
    private String email;
    private String phone;
    private String avatar;
    private double wallet;
    private String status;
    private Role role;
    private String province;
    private String district;
    private String ward;

}
