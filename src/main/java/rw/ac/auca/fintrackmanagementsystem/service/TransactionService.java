package rw.ac.auca.fintrackmanagementsystem.service;

import rw.ac.auca.fintrackmanagementsystem.model.Budget;
import rw.ac.auca.fintrackmanagementsystem.model.Transaction;
import rw.ac.auca.fintrackmanagementsystem.repository.BudgetRepository;
import rw.ac.auca.fintrackmanagementsystem.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    public List<Transaction> getAll() {
        return transactionRepository.findAll();
    }

    public Transaction getById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id " + id));
    }

    // returns a warning message if this transaction pushes the category over budget, or null if it's fine
    public String create(Transaction transaction) {
        Transaction saved = transactionRepository.save(transaction);
        return checkBudgetStatus(saved);
    }

    public String update(Long id, Transaction updated) {
        Transaction existing = getById(id);
        existing.setDescription(updated.getDescription());
        existing.setAmount(updated.getAmount());
        existing.setDate(updated.getDate());
        existing.setPaymentMethod(updated.getPaymentMethod());
        existing.setCategory(updated.getCategory());
        Transaction saved = transactionRepository.save(existing);
        return checkBudgetStatus(saved);
    }

    public void delete(Long id) {
        transactionRepository.deleteById(id);
    }

    // ---- the core household-finance business rule ----
    private String checkBudgetStatus(Transaction transaction) {
        YearMonth ym = YearMonth.from(transaction.getDate());
        Optional<Budget> budgetOpt = budgetRepository.findByCategoryIdAndMonthAndYear(
                transaction.getCategory().getId(), ym.getMonthValue(), ym.getYear());

        if (budgetOpt.isEmpty()) {
            return null; // no budget set for this category/month, nothing to check
        }

        Budget budget = budgetOpt.get();
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        double totalSpent = transactionRepository
                .findByCategoryIdAndDateBetween(transaction.getCategory().getId(), start, end)
                .stream()
                .mapToDouble(Transaction::getAmount)
                .sum();

        if (totalSpent > budget.getLimitAmount()) {
            double over = totalSpent - budget.getLimitAmount();
            return String.format(
                    "You've allocated %.2f for %s this month, you've now spent %.2f — %.2f over budget.",
                    budget.getLimitAmount(), transaction.getCategory().getName(), totalSpent, over
            );
        }
        return null; // within budget
    }
}