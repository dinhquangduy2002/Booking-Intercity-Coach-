package com.booking_trip_be.controller;

import com.booking_trip_be.entity.Account;
import com.booking_trip_be.service.IAccountService;
import com.booking_trip_be.service.impl.EmailService;
import net.bytebuddy.utility.RandomString;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/forgot")
public class ForgotPasswordController {
    @Autowired
    IAccountService accountService;
    @Autowired
    EmailService emailService;

    @PostMapping()
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> requestBody) {
        String email = requestBody.get("email");


        Account account = accountService.getAccountByEmail(email);
        if (account == null) {
            return ResponseEntity.badRequest().body("Email không tồn tại");
        }


        String newPassword = RandomString.make(10);
        account.setPassword(newPassword);
        accountService.save(account);


        String emailContent = "Mật khẩu mới của bạn là: " + newPassword;
        emailService.sendEmail(email, "Yêu cầu gửi lại mật khẩu", emailContent);

        return ResponseEntity.ok("Email đã được gửi");
    }
}
