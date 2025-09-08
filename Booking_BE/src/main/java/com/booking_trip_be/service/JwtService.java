package com.booking_trip_be.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtService {
    private static final String SECRET_KEY = "1234567890";
    private static final long EXPIRE_TIME = 86400000000L;

    public String createToken(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(new Date().getTime() + EXPIRE_TIME * 1000))
                .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
                .compact();
    }

    public String getUsernameFromJwtToken (String token) {
        String username = Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody().getSubject();
        return username;
    }
}
