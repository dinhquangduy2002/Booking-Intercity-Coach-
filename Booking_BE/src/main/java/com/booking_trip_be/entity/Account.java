package com.booking_trip_be.entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(unique = true)
    private String username;
    private String password;
    private String firstname;
    private String lastname;
    private String address;
    private String province;
    private String district;
    private String ward;
    @Column(unique = true)
    private String email;
    private String phone;
    private String avatar;
    private double wallet;
    private String status;
    @ManyToOne
    private Role role;

    public Account(String username, String password, String email, String phone, String avatar, String status, Role role){
        this.username = username;
        this.password = password;
        this.email = email;
        this.phone = phone;
        this.avatar = avatar;
        this.status = status;
        this.role = role;
    }
}
