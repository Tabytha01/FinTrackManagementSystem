package rw.ac.auca.fintrackmanagementsystem.repository;

import rw.ac.auca.fintrackmanagementsystem.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // used by the budget-check logic: sum of expenses in a category within a date range
    List<Transaction> findByCategoryIdAndDateBetween(Long categoryId, LocalDate start, LocalDate end);
}