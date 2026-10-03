package rw.ac.auca.fintrackmanagementsystem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import rw.ac.auca.fintrackmanagementsystem.model.Notification;
import rw.ac.auca.fintrackmanagementsystem.repository.NotificationRepository;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public List<Notification> getAll() {
        return notificationRepository.findAll();
    }

    @GetMapping("/unread")
    public List<Notification> getUnread() {
        return notificationRepository.findByReadFalse();
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable String id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setRead(true);
        return notificationRepository.save(n);
    }
}
