package rw.ac.auca.fintrackmanagementsystem.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;
    private String type;
    private Long categoryId;
    private String categoryName;
    private String message;
    private Double amountOver;
    private LocalDateTime timestamp;
    private boolean read;

    public Notification() {}

    public Notification(Long categoryId, String categoryName, String message, Double amountOver) {
        this.type = "BUDGET_EXCEEDED";
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.message = message;
        this.amountOver = amountOver;
        this.timestamp = LocalDateTime.now();
        this.read = false;
    }

    public String getId() { return id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Double getAmountOver() { return amountOver; }
    public void setAmountOver(Double amountOver) { this.amountOver = amountOver; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
}
