package rw.ac.auca.fintrackmanagementsystem.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import rw.ac.auca.fintrackmanagementsystem.model.Notification;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByReadFalse();
    List<Notification> findByCategoryId(Long categoryId);
}
