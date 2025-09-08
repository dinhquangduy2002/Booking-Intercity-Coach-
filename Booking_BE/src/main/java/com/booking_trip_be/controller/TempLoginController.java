package com.booking_trip_be.controller;

import com.booking_trip_be.entity.Account;
import com.booking_trip_be.service.IAccountService;
import com.booking_trip_be.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin("*")
@RestController
public class TempLoginController {
    @Autowired
    IAccountService iAccountService;
    @Autowired
    JwtService jwtService;
    @Autowired
    AuthenticationManager authenticationManager;

    @PostMapping("/api/temp/login")
    public String login(@RequestBody Account account) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                account.getUsername(), account.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtService.createToken(authentication);
        return token;
    }
}
