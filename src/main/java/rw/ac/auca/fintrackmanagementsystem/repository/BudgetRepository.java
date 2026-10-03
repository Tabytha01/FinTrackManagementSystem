package rw.ac.auca.fintrackmanagementsystem.repository;

import rw.ac.auca.fintrackmanagementsystem.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByCategoryIdAndMonthAndYear(Long categoryId, Integer month, Integer year);
}