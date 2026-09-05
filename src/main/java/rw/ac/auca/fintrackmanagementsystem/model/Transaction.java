package rw.ac.auca.fintrackmanagementsystem.model;

import javax.annotation.Generated;
import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

import static com.sun.beans.introspect.PropertyInfo.Name.description;

@Entity
@Table(name = "transactions")
public class Transaction implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String category;

    private Long getId() { return id;}
    public void setId(Long id) { this.id = id; }

    public String getDescription(){ return description;}
    public void setDescription(String description) { this.description = description; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getCategory() { return category; }
    public void setCategory(String category) {this.category = category;}
}

