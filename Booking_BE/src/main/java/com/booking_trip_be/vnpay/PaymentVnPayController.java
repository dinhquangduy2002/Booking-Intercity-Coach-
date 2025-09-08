package com.booking_trip_be.vnpay;

import com.booking_trip_be.entity.Booking;
import com.booking_trip_be.service.IBookingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/pay/vnpay")
public class PaymentVnPayController {
    public static final String URL_PAYPAL_SUCCESS = "success";
    private Logger log = LoggerFactory.getLogger(getClass());

    @Autowired
    IBookingService bookingService;

    @PostMapping
    protected ResponseEntity<String> create(@RequestBody PaymentDTO paymentDTO, HttpServletRequest req) throws ServletException, IOException {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        Long amount = (Math.round(paymentDTO.getTotal()*100));
        String bankCode = "NCB"; // Hoặc lấy từ request nếu cần

        String vnp_TxnRef = Config.getRandomNumber(8) + "_" + paymentDTO.getIdBooking();// Lưu idBooking vào vnp_TxnRef
        String vnp_IpAddr = req.getRemoteAddr(); // Lấy IP từ request

        String vnp_TmnCode = Config.vnp_TmnCode;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");

        if (bankCode != null && !bankCode.isEmpty()) {
            vnp_Params.put("vnp_BankCode", bankCode);
        }
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);

        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", "http://localhost:8080/api/pay/vnpay/" + URL_PAYPAL_SUCCESS+"?idB="+paymentDTO.getIdBooking());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = Config.hmacSHA512(Config.secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = Config.vnp_PayUrl + "?" + queryUrl;

        return ResponseEntity.ok(paymentUrl);
    }

    @GetMapping(URL_PAYPAL_SUCCESS)
    public ModelAndView paymentResponse(int idB,HttpServletRequest request) {
        ModelAndView modelAndView;
        Booking booking = bookingService.findById(idB);
        booking.setStatus("Chờ nhận vé");
        bookingService.save(booking);
        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
        if ("00".equals(vnp_ResponseCode)) {
            modelAndView = new ModelAndView("success");
        } else {
            modelAndView = new ModelAndView("failed");
        }
        return modelAndView;
    }
}