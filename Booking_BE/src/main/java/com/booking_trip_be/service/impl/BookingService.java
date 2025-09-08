package com.booking_trip_be.service.impl;

import com.booking_trip_be.dto.BillPDF;
import com.booking_trip_be.dto.query.SpendingDto;
import com.booking_trip_be.entity.Account;
import com.booking_trip_be.entity.Booking;
import com.booking_trip_be.entity.Review;
import com.booking_trip_be.entity.Trip;
import com.booking_trip_be.repository.IAccountRepo;
import com.booking_trip_be.repository.IBookingRepo;
import com.booking_trip_be.repository.IReviewRepo;
import com.booking_trip_be.repository.ITripRepo;
import com.booking_trip_be.service.IBookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import javax.mail.MessagingException;
import java.io.IOException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Locale;

@Service
public class BookingService implements IBookingService {
    @Autowired
    private IBookingRepo bookingRepo;
    @Autowired
    private EmailService emailService;
    @Autowired
    private IAccountRepo accountRepo;
    @Autowired
    private IReviewRepo reviewRepo;
    @Override
    public List<Booking> findAllByTripIdAndStatus(int tripId) {
        return bookingRepo.findAllBytripIdAndStatus(tripId);
    }

    @Override
    public Booking bookingTrip(Booking booking) {
        Account account = accountRepo.findById(booking.getAccount().getId()).get();
        booking.setAccount(account);
        try {
            String subject = "Thông báo đặt vé";
            String toEmail = booking.getTrip().getOwner().getEmail();
            NumberFormat numberFormat = NumberFormat.getCurrencyInstance(new Locale("vi","VN"));
            String content = "<b>Chào bạn</b>,<br><p>Bạn đang có người book vé. Thông tin vé:</p>"
                    + "<p>- Lịch trình: " + booking.getTrip().getName() + "</p>"
                    + "<p>- Địa chỉ: " + booking.getTrip().getAddress() + "</p>"
                    + "<p>- Khách hàng: " + booking.getAccount().getUsername() + "</p>"
                    + "<p>- Email: " + booking.getAccount().getEmail() + "</p>"
                    + "<p>- Điểm đón: Từ " + booking.getPickUp() + " đến " + booking.getDestination() + "</p>"
                    + "<p>- Tổng tiền: " + numberFormat.format(booking.getTotal()) + "</p>"
                    + "<br><p>Vui lòng đăng nhập vào website: <a href='http://localhost:3000' target='_blank'>https://www.LUXURY.com</a> để xác nhận ve.</p>";
            emailService.sendEmailBooking(subject, toEmail, content);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
        return bookingRepo.save(booking);
    }

    @Override
    public Booking waitOwnerConfirmBooking(int bookingId) {
        Booking booking = bookingRepo.findById(bookingId);
        if (booking.getStatus().equals("Chờ xác nhận")) {
            booking.setStatus("Chờ nhận vé");
            try {
                emailService.sendBill(booking.getAccount().getEmail(), booking);
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            } catch (IOException e) {
                throw new RuntimeException(e);
            } catch (ParseException e) {
                throw new RuntimeException(e);
            }
            return bookingRepo.save(booking);
        }
        return null;
    }

    @Override
    public void cancelBooking(Booking booking, String toEmail, String contentTitle, String message) throws MessagingException {
        if (booking.getStatus().equals("Chờ nhận vé") || booking.getStatus().equals("Chờ xác nhận")) {
            String subject = "Thông báo hủy vé";
            NumberFormat numberFormat = NumberFormat.getCurrencyInstance(new Locale("vi","VN"));
            String content = "<b>Chào bạn</b>,<br><p>" + contentTitle + ". Thông tin lịch đã đặt:</p>"
                    + "<p>- Lịch trình: " + booking.getTrip().getName() + "</p>"
                    + "<p>- Địa chỉ: " + booking.getTrip().getAddress() + "</p>"
                    + "<p>- Khách hàng: " + booking.getAccount().getUsername() + "</p>"
                    + "<p>- Email: " + booking.getAccount().getEmail() + "</p>"
                    + "<p>- Điểm đón: Từ " + booking.getPickUp() + " đến " + booking.getDestination() + "</p>"
                    + "<p>- Tổng tiền: " + numberFormat.format(booking.getTotal()) + "</p>"
                    + "<p>- Lí do hủy: " + message + "</p>";
            emailService.sendEmailBooking(subject, toEmail, content);
            booking.setStatus("Đã hủy");
            booking.setTotal(0);
            bookingRepo.save(booking);
        }
    }

    @Override
    public List<Booking> getAllBooking() {
        return bookingRepo.findAll();
    }

    @Override
    public void save(Booking booking) {
        bookingRepo.save(booking);
    }

    @Override
    public void deleteById(int id) {
        bookingRepo.deleteById(id);
    }
    @Override
    public List<Booking> getAll() {
        return bookingRepo.findAll();
    }
    @Override
    public List<Double> getDailyRevenueByOwnerAndWeek(int ownerId,int month,int year, int startDay,int endDay) {
        return this.getDailyRevenuesByOwnerAndWeek( ownerId, month, year,  startDay, endDay);
    }

    @Override
    public Page<Booking> findByTripAndStartTimeAndEndTimeAndStatus(int ownerId, String nameSearch, String status, LocalDateTime startTime, LocalDateTime endTime, Pageable pageable) {
        return bookingRepo.findBytripAndStartTimeAndEndTimeAndStatus(ownerId,nameSearch,status,startTime,endTime,pageable);
    }

    @Override
    public Review createReview(Review review) {
        review.setCreateAt(LocalDate.now());
        review.setStatus("Hiện");
        return reviewRepo.save(review);
    }

    List<Double> getDailyRevenuesByOwnerAndWeek(int ownerId, int year, int month, int startDay, int endDay) {
        List<Object[]> result = bookingRepo.getDailyRevenueByOwnerAndWeek(ownerId, year, month, startDay, endDay);
        List<Double> dailyRevenues = new ArrayList<>();

        for (int day = startDay; day <= endDay; day++) {
            boolean found = false;
            for (Object[] row : result) {
                // row[0] có thể là BigInteger, Integer, Long...
                int rowDay;
                if (row[0] instanceof BigInteger) {
                    rowDay = ((BigInteger) row[0]).intValue();
                } else if (row[0] instanceof Number) {
                    rowDay = ((Number) row[0]).intValue();
                } else {
                    throw new RuntimeException("Unknown day type: " + row[0].getClass());
                }

                // row[1] có thể là BigDecimal, Double, Long...
                double revenue;
                if (row[1] instanceof BigDecimal) {
                    revenue = ((BigDecimal) row[1]).doubleValue();
                } else if (row[1] instanceof BigInteger) {
                    revenue = ((BigInteger) row[1]).doubleValue();
                } else if (row[1] instanceof Number) {
                    revenue = ((Number) row[1]).doubleValue();
                } else {
                    throw new RuntimeException("Unknown revenue type: " + row[1].getClass());
                }

                if (rowDay == day) {
                    dailyRevenues.add(revenue);
                    found = true;
                    break;
                }
            }
            if (!found) {
                dailyRevenues.add(0.0);
            }
        }
        return dailyRevenues;
    }


    @Override
    public Page<Booking> getByIdAccount(Pageable pageable , int idAccount) {
        return bookingRepo.getByIdAccount(pageable, idAccount);
    }

    @Override
    public Booking findById(int id) {
        return bookingRepo.findById(id);
    }

    @Override
    public SpendingDto getSpendingUser(int idAccount) {
        return bookingRepo.getSpendingUser(idAccount);
    }

    @Override
    public Page<Booking> getRentalHistoryIdAccount(Pageable pageable, int idAccount, String tripName , String status) {
        return bookingRepo.getHistoryRentalByIdAccount(pageable , idAccount , tripName ,  status);
    }
    @Override
    public boolean isUserAllowedToBook(int idAccount) {
        List<String> restrictedStatuses = List.of("Chờ nhận vé", "Đã khởi hành");
        return bookingRepo.countCurrentActiveBookings(idAccount)== 0;
    }
}