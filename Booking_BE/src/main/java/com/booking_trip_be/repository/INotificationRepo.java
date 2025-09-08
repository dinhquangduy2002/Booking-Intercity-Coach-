package com.booking_trip_be.repository;

import com.booking_trip_be.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;
import java.util.List;

public interface INotificationRepo extends JpaRepository<Notification, Integer> {
    @Query("SELECT COUNT (*) FROM Notification n WHERE n.receiver.id = :accountLoginId AND n.status=false")
    int countUnreadNotifyByAccountLoginId(@Param("accountLoginId") int accountLoginId);

    @Query("SELECT n FROM Notification n WHERE n.receiver.id = :accountId ORDER BY n.createAt DESC")
    List<Notification> findAllByReceiverIdAndOrderByCreateAtDesc(int accountId);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.status = true WHERE n.receiver.id= :accountId")
    void changeStatusNotify(@Param("accountId") int accountId);
}
