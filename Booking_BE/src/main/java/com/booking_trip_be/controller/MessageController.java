package com.booking_trip_be.controller;

import com.booking_trip_be.entity.Account;
import com.booking_trip_be.entity.Message;
import com.booking_trip_be.entity.Notification;
import com.booking_trip_be.service.IAccountService;
import com.booking_trip_be.service.IMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("*")
public class MessageController {
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;
    @Autowired
    private IMessageService messageService;
    @Autowired
    private IAccountService accountService;

    @MessageMapping("/chat")
    public void chat(Message message) {
        String destinationReceive = "/topic/" + message.getReceiver().getId();
        simpMessagingTemplate.convertAndSend(destinationReceive, message);
    }

    @MessageMapping("/block")
    public void block(Message message) {
        String destinationReceive = "/block/" + message.getReceiver().getId();
        simpMessagingTemplate.convertAndSend(destinationReceive, message);
    }

    @MessageMapping("/notify")
    public void notify(Notification notification) {
            String destinationReceive = "/notify/" + notification.getReceiver().getId();
            simpMessagingTemplate.convertAndSend(destinationReceive, notification);
    }

    @MessageMapping("/admin")
    public void acceptOwner(Notification notification) {
        List<Account> list = accountService.findAdmins();
        for (Account account : list) {
            String destinationReceive = "/admin/" + account.getId();
            simpMessagingTemplate.convertAndSend(destinationReceive, notification);
        }
    }

    @GetMapping("/api/messages/{senderId}/{receiverId}")
    public ResponseEntity<?> getAllMessagesBySenderIdAndReceiverId(@PathVariable int senderId,
                                                                   @PathVariable int receiverId) {
        try {
            return ResponseEntity.ok(messageService.findAllBySenderIdAndReceiverId(senderId, receiverId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }

    @PostMapping("/api/messages")
    public ResponseEntity<?> saveMessage(@RequestBody Message message) {
        try {
            return ResponseEntity.ok(messageService.save(message));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }

    @GetMapping("/api/messages/count/{receiverId}")
    public int countUnreadMessagesByReceiverId(@PathVariable int receiverId) {
        try {
            return messageService.countUnreadMessagesByReceiverId(receiverId);
        } catch (Exception e) {
            return 0;
        }
    }

    @GetMapping("/api/messages/count/{accountId}/{senderId}")
    public int countUnreadMessagesByAccountLoginIdAndSenderId(@PathVariable int accountId,
                                                              @PathVariable int senderId) {
        try {
            return messageService.countUnreadMessagesByAccountLoginIdAndSenderId(accountId, senderId);
        } catch (Exception e) {
            return 0;
        }
    }

    @PutMapping("/api/messages/change-status/{accountId}/{senderId}")
    public ResponseEntity<?> changeStatusMessage(@PathVariable int accountId, @PathVariable int senderId) {
        try {
            messageService.changeStatusMessage(accountId, senderId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }
}
