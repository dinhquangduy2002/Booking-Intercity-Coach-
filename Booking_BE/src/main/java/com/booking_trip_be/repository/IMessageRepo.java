package com.booking_trip_be.repository;

import com.booking_trip_be.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;
import java.util.List;

public interface IMessageRepo extends JpaRepository<Message, Integer> {
    @Query("SELECT m from Message m WHERE m.sender.id = :senderId AND m.receiver.id = :receiverId" +
            " OR m.sender.id = :receiverId AND m.receiver.id = :senderId order by m.createAt")
    List<Message> findAllBySenderIdAndReceiverId(@Param("senderId") int senderId, @Param("receiverId") int receiverId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :receiverId AND m.status = false")
    int countUnreadMessagesByReceiverId(@Param("receiverId") int receiverId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.sender.id = :senderId AND m.receiver.id = :accountLoginId AND m.status = false")
    int countUnreadMessagesByAccountLoginIdAndSenderId(@Param("accountLoginId") int accountLoginId, @Param("senderId") int senderId);

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.status = true WHERE m.sender.id = :senderId AND m.receiver.id= :receiverId")
    void changeStatusMessage(@Param("senderId") int senderId, @Param("receiverId") int receiverId);
}
