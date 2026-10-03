package rw.ac.auca.fintrackmanagementsystem.messaging;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import rw.ac.auca.fintrackmanagementsystem.config.RabbitMQConfig;
import rw.ac.auca.fintrackmanagementsystem.model.Notification;
import rw.ac.auca.fintrackmanagementsystem.repository.NotificationRepository;

@Component
public class BudgetExceededConsumer {

    @Autowired
    private NotificationRepository notificationRepository;

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public void consume(BudgetExceededEvent event) {
        Notification notification = new Notification(
                event.getCategoryId(),
                event.getCategoryName(),
                event.getMessage(),
                event.getAmountOver()
        );
        notificationRepository.save(notification);
    }
}
