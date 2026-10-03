package rw.ac.auca.fintrackmanagementsystem.messaging;

import java.io.Serializable;

public class BudgetExceededEvent implements Serializable {

    private Long categoryId;
    private String categoryName;
    private String message;
    private Double amountOver;

    public BudgetExceededEvent() {}

    public BudgetExceededEvent(Long categoryId, String categoryName, String message, Double amountOver) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.message = message;
        this.amountOver = amountOver;
    }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Double getAmountOver() { return amountOver; }
    public void setAmountOver(Double amountOver) { this.amountOver = amountOver; }
}
