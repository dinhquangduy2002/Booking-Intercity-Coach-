package com.booking_trip_be.vnpay;

import lombok.Data;

@Data
public class PaymentDTO {
    private Double total;
    private Integer idBooking;
}

