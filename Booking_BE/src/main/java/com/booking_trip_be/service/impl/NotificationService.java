package com.booking_trip_be.service.impl;

import com.booking_trip_be.entity.Notification;
import com.booking_trip_be.repository.INotificationRepo;
import com.booking_trip_be.service.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService implements INotificationService {
    @Autowired
    private INotificationRepo notificationRepo;
    @Override
    public int countUnreadNotifyByAccountLoginId(int accountId) {
        return notificationRepo.countUnreadNotifyByAccountLoginId(accountId);
    }

    @Override
    public List<Notification> findAllByReceiverId(int accountId) {
        return notificationRepo.findAllByReceiverIdAndOrderByCreateAtDesc(accountId);
    }

    @Override
    public void changeStatusNotify(int accountId) {
        notificationRepo.changeStatusNotify(accountId);
    }

    @Override
    public Notification save(Notification notification) {
        notification.setCreateAt(LocalDateTime.now());
        notification.setStatus(false);
        return notificationRepo.save(notification);
    }
}
