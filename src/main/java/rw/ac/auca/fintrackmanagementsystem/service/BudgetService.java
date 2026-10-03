package rw.ac.auca.fintrackmanagementsystem.service;

import rw.ac.auca.fintrackmanagementsystem.model.Budget;
import rw.ac.auca.fintrackmanagementsystem.repository.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    public List<Budget> getAll() {
        return budgetRepository.findAll();
    }

    public Budget getById(Long id) {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with id " + id));
    }

    public Budget create(Budget budget) {
        return budgetRepository.save(budget);
    }

    public Budget update(Long id, Budget updated) {
        Budget existing = getById(id);
        existing.setCategory(updated.getCategory());
        existing.setLimitAmount(updated.getLimitAmount());
        existing.setMonth(updated.getMonth());
        existing.setYear(updated.getYear());
        return budgetRepository.save(existing);
    }

    public void delete(Long id) {
        budgetRepository.deleteById(id);
    }
}