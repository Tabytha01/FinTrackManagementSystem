package rw.ac.auca.fintrackmanagementsystem.controller;

import rw.ac.auca.fintrackmanagementsystem.model.Transaction;
import rw.ac.auca.fintrackmanagementsystem.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping
    public List<Transaction> getAll() {
        return transactionService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody Transaction transaction) {
        String warning = transactionService.create(transaction);
        Map<String, Object> response = new HashMap<>();
        response.put("transaction", transaction);
        response.put("budgetWarning", warning); // null if within budget
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @Valid @RequestBody Transaction transaction) {
        String warning = transactionService.update(id, transaction);
        Map<String, Object> response = new HashMap<>();
        response.put("transaction", transaction);
        response.put("budgetWarning", warning);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transactionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}