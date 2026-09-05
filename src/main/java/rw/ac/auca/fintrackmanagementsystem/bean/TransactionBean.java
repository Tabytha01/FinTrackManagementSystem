package rw.ac.auca.fintrackmanagementsystem.bean;

import rw.ac.auca.fintrackmanagementsystem.model.Transaction;
import rw.ac.auca.fintrackmanagementsystem.util.HibernateUtil;

import javax.inject.Named;
import javax.enterprise.context.SessionScoped;
import javax.faces.application.FacesMessage;
import javax.faces.context.FacesContext;
import javax.annotation.PostConstruct;
import org.hibernate.Session;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
@Named("transactionBean")
@SessionScoped
public class TransactionBean implements Serializable {

    private List<Transaction> transactions;

    // form fields
    private String description;
    private Double amount;
    private LocalDate date;
    private String category;

    // holds the id of the transaction being edited (null = create mode)
    private Long editingId;

    @PostConstruct
    public void init() {
        loadTransactions();
    }

    // ---- READ: loads all transactions from the database ----
    private void loadTransactions() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transactions = session.createQuery("FROM Transaction ORDER BY date DESC", Transaction.class).list();
        }
    }

    // ---- CREATE / UPDATE ----
    public String saveTransaction() {
        // ---- Business logic layer validation (inside the ManagedBean) ----
        if (amount != null && amount <= 0) {
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_ERROR, "Amount must be greater than 0", null));
            return null;
        }
        if (date != null && date.isAfter(LocalDate.now())) {
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_ERROR, "Transaction date cannot be in the future", null));
            return null;
        }

        Session session = HibernateUtil.getSessionFactory().openSession();
        org.hibernate.Transaction tx = null;
        try {
            tx = session.beginTransaction();

            if (editingId == null) {
                // CREATE
                Transaction t = new Transaction();
                t.setDescription(description);
                t.setAmount(amount);
                t.setDate(date);
                t.setCategory(category);
                session.persist(t);
            } else {
                // UPDATE
                Transaction t = session.get(Transaction.class, editingId);
                t.setDescription(description);
                t.setAmount(amount);
                t.setDate(date);
                t.setCategory(category);
                session.update(t);
            }

            tx.commit();
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            // ---- Database layer validation catches this: NOT NULL columns reject bad data ----
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_ERROR, "Could not save transaction: " + e.getMessage(), null));
            return null;
        } finally {
            session.close();
        }

        clearForm();
        loadTransactions();
        return "transactionList?faces-redirect=true";
    }

    // ---- populate form fields for editing ----
    public String editTransaction(Transaction t) {
        this.editingId = t.getId();
        this.description = t.getDescription();
        this.amount = t.getAmount();
        this.date = t.getDate();
        this.category = t.getCategory();
        return "transactionForm?faces-redirect=true";
    }

    // ---- DELETE ----
    public String deleteTransaction(Transaction t) {
        Session session = HibernateUtil.getSessionFactory().openSession();
        org.hibernate.Transaction tx = null;
        try {
            tx = session.beginTransaction();
            Transaction managed = session.get(Transaction.class, t.getId());
            if (managed != null) {
                session.delete(managed);
            }
            tx.commit();
        } catch (Exception e) {
            if (tx != null) tx.rollback();
        } finally {
            session.close();
        }
        loadTransactions();
        return "transactionList?faces-redirect=true";
    }

    public String cancelEdit() {
        clearForm();
        return "transactionForm?faces-redirect=true";
    }

    private void clearForm() {
        editingId = null;
        description = null;
        amount = null;
        date = null;
        category = null;
    }

    public boolean isEditMode() {
        return editingId != null;
    }

    // getters and setters
    public List<Transaction> getTransactions() { return transactions; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}