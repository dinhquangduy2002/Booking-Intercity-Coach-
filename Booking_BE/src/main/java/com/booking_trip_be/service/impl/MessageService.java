package com.booking_trip_be.service.impl;

import com.booking_trip_be.entity.Message;
import com.booking_trip_be.repository.IMessageRepo;
import com.booking_trip_be.service.IMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService implements IMessageService {
    @Autowired
    private IMessageRepo messageRepo;
    @Override
    public List<Message> findAllBySenderIdAndReceiverId(int senderId, int receiverId) {
        return messageRepo.findAllBySenderIdAndReceiverId(senderId, receiverId);
    }

    @Override
    public Message save(Message message) {
        message.setStatus(false);
        message.setCreateAt(LocalDateTime.now());
        return messageRepo.save(message);
    }

    @Override
    public int countUnreadMessagesByReceiverId(int receiverId) {
        return messageRepo.countUnreadMessagesByReceiverId(receiverId);
    }

    @Override
    public int countUnreadMessagesByAccountLoginIdAndSenderId(int accountLoginId, int senderId) {
        return messageRepo.countUnreadMessagesByAccountLoginIdAndSenderId(accountLoginId, senderId);
    }

    @Override
    public void changeStatusMessage(int senderId, int receiverId) {
        messageRepo.changeStatusMessage(senderId, receiverId);
    }
}
