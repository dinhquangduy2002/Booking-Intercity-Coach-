package com.booking_trip_be.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Owner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String firstname;
    private String lastname;
    private String email;
    private String phone;
    private String address;
    private String province;
    private String district;
    private String ward;
    @Column(columnDefinition = "TEXT")
    private String frontside;
    @Column(columnDefinition = "TEXT")
    private String backside;
    private String status;
    @OneToOne
    private Account account;
    @Column(columnDefinition = "TEXT")
    private String avatar;

    public Owner(String status) {
        this.status = status;
    }
}
