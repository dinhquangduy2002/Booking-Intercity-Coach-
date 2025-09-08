package com.booking_trip_be.controller;

import com.booking_trip_be.dto.BookingDto;
import com.booking_trip_be.dto.SearchRequest;
import com.booking_trip_be.entity.Booking;
import com.booking_trip_be.entity.Trip;
import com.booking_trip_be.entity.Review;
import com.booking_trip_be.repository.ITripRepo;
import com.booking_trip_be.service.IBookingService;
import com.booking_trip_be.service.ITripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/bookings")
public class BookingController {
    @Autowired
    IBookingService bookingService;
    @Autowired
    ITripService TripService;
    @Autowired
    ITripRepo iTripRepo;


    @GetMapping("/list")
    public ResponseEntity<List<Booking>> listBooking() {
        return new ResponseEntity<>(bookingService.getAllBooking(), HttpStatus.OK);
    }

    @PostMapping("/checkin/{id}")
    public ResponseEntity<?> checkin(@PathVariable int id) {
        Booking booking = bookingService.findById(id);
        Trip trip = TripService.findById(booking.getTrip().getId());
        if (booking.getStatus().equals("Chờ nhận vé")) {
            booking.setStatus("Đã khởi hành");
            bookingService.save(booking);
            TripService.saveTrip(trip);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().body("Vé không ở trạng thái chờ nhận vé");
        }
    }

    @PostMapping("/wait/{id}")
    public ResponseEntity<?> waitOwnerConfirmBooking(@PathVariable int id) {
        try {
            Booking booking = bookingService.waitOwnerConfirmBooking(id);
            if (booking != null) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().body("Vé không ở trạng thái chờ nhận vé");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }

    @PostMapping("/checkout/{id}")
    public ResponseEntity<?> checkout(@PathVariable int id) {
        Booking booking = bookingService.findById(id);
        Trip trip = TripService.findById(booking.getTrip().getId());
        if (booking.getStatus().equals("Đã khởi hành")) {
            booking.setStatus("Đã hoàn thành");
            bookingService.save(booking);
            TripService.saveTrip(trip);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().body("Vé không ở trạng thái đã nhận vé");
        }
    }

    @PostMapping("/delete/{id}")
    public ResponseEntity<?> deleteBookingById(@PathVariable int id) {
        bookingService.deleteById(id);
        return ResponseEntity.ok("Đã xoá thành công");
    }

    @GetMapping("/Trip/{TripId}")
    public ResponseEntity<?> getBookingsByTripId(@PathVariable int TripId) {
        try {
            return ResponseEntity.ok(bookingService.findAllByTripIdAndStatus(TripId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> bookTrip(@RequestBody Booking booking) {
        // Kiểm tra nếu người dùng đang có chuyến đi chưa hoàn thành (đang hoạt động)
        int idAccount = booking.getAccount().getId();
        if (!bookingService.isUserAllowedToBook(idAccount)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Bạn đang có chuyến đi chưa hoàn thành. Vui lòng hoàn tất trước khi đặt thêm.");
        }

        Trip trip = iTripRepo.findById(booking.getTrip().getId()).get();
        if ((trip.getSeat() - trip.getSeatBooking()) < booking.getQuantity()) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
        trip.setSeatBooking(trip.getSeatBooking() + booking.getQuantity());
        iTripRepo.save(trip);
        booking.setCreate_at(LocalDateTime.now());

        try {
            return ResponseEntity.ok(bookingService.bookingTrip(booking));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }


    @GetMapping("/{ownerId}/week")
    private List<Double> getDailyRevenueByOwnerAndWeek(
            @PathVariable int ownerId,
            @Param(value = "month") int month,
            @Param(value = "year") int year,
            @Param(value = "startDay") int startDay,
            @Param(value = "endDay") int endDay) {
        return bookingService.getDailyRevenueByOwnerAndWeek(ownerId, month, year, startDay, endDay);
    }

    @PostMapping("/{ownerId}/search")
    private Page<Booking> searchBookingsByOwnerId(
            @PathVariable int ownerId,
            @RequestBody SearchRequest requestData,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        String nameSearch = requestData.getNameSearch();
        String status = requestData.getStatus();
        LocalDateTime selectedDateStart = requestData.getSelectedDateStart();
        LocalDateTime selectedDateEnd = requestData.getSelectedDateEnd();
        Pageable pageable;
        String sortBy = "create_at";
        Sort sort = Sort.by(Sort.Order.desc(sortBy));
        pageable = PageRequest.of(page, size, sort);
        return bookingService.findByTripAndStartTimeAndEndTimeAndStatus(ownerId, nameSearch, status, selectedDateStart, selectedDateEnd, pageable);
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return new ResponseEntity<>(bookingService.getAll(), HttpStatus.OK);
    }

    @GetMapping("/getByIdAccount/{idAccount}")
    public ResponseEntity<?> getByIdAccount(@RequestParam(value = "page", defaultValue = "0") int page,
                                            @RequestParam(value = "size", defaultValue = "5") int size,
                                            @PathVariable int idAccount) {
        Pageable pageable;
        String sortBy = "create_at";
        Sort sort = Sort.by(Sort.Order.desc(sortBy));
        pageable = PageRequest.of(page, size, sort);
        return new ResponseEntity<>(bookingService.getByIdAccount(pageable, idAccount), HttpStatus.OK);
    }

    @PostMapping("/getByIdAccount/{idAccount}")
    public ResponseEntity<?> getHistoryRentalAccount(@RequestParam(value = "page", defaultValue = "0") int page,
                                                     @RequestParam(value = "size", defaultValue = "5") int size,
                                                     @PathVariable int idAccount
            , @RequestBody BookingDto bookingDto) {
        Pageable pageable;
        String sortBy = "create_at";
        Sort sort = Sort.by(Sort.Order.desc(sortBy));
        pageable = PageRequest.of(page, size, sort);
        return new ResponseEntity<>(bookingService.getRentalHistoryIdAccount(pageable
                , idAccount
                , bookingDto.getTripName()
                , bookingDto.getStatus()), HttpStatus.OK);
    }

    @PostMapping("/cancel-booking/{id}")
    public ResponseEntity<?> cancelBookingUser(@PathVariable int id, @RequestBody Map<String, String> requestBody) {
        try {
            String message = requestBody.get("message");
            Booking booking = bookingService.findById(id);
            Trip trip = iTripRepo.findById(booking.getTrip().getId()).get();
            trip.setSeatBooking(trip.getSeatBooking() - booking.getQuantity());
            iTripRepo.save(trip);
            String toEmail = booking.getTrip().getOwner().getEmail();
            String contentTitle = "Khách hàng đã hủy lịch";
            bookingService.cancelBooking(booking, toEmail, contentTitle, message);
            return ResponseEntity.ok("Hủy thành công");
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }

    @PostMapping("/reviews")
    public ResponseEntity<?> createReview(@RequestBody Review review) {
        try {
            return ResponseEntity.ok(bookingService.createReview(review));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }
    @GetMapping("/getSpending/{idAccount}")
   public ResponseEntity<?> getSpendingAccount(@PathVariable int idAccount) {
        return ResponseEntity.ok(bookingService.getSpendingUser(idAccount));
   }
}
