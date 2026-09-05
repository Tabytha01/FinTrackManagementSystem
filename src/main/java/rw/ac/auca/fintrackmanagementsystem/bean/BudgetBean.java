package rw.ac.auca.fintrackmanagementsystem.bean;

import rw.ac.auca.fintrackmanagementsystem.model.Budget;
import rw.ac.auca.fintrackmanagementsystem.util.HibernateUtil;

import javax.inject.Named;
import javax.enterprise.context.SessionScoped;
import javax.faces.application.FacesMessage;
import javax.faces.context.FacesContext;
import javax.annotation.PostConstruct;
import org.hibernate.Session;

import java.io.Serializable;
import java.util.List;

@Named("budgetBean")
@SessionScoped
public class BudgetBean implements Serializable {

    private List<Budget> budgets;

    private String category;
    private Double limitAmount;
    private Integer month;
    private Integer year;

    private Long editingId;

    @PostConstruct
    public void init() {
        loadBudgets();
    }

    private void loadBudgets() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            budgets = session.createQuery("FROM Budget ORDER BY year DESC, month DESC", Budget.class).list();
        }
    }

    public String saveBudget() {
        // ---- Business logic layer validation ----
        if (limitAmount != null && limitAmount <= 0) {
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_ERROR, "Budget limit must be greater than 0", null));
            return null;
        }
        if (month != null && (month < 1 || month > 12)) {
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_ERROR, "Month must be between 1 and 12", null));
            return null;
        }

        Session session = HibernateUtil.getSessionFactory().openSession();
        org.hibernate.Transaction tx = null;
        try {
            tx = session.beginTransaction();

            if (editingId == null) {
                Budget b = new Budget();
                b.setCategory(category);
                b.setLimitAmount(limitAmount);
                b.setMonth(month);
                b.setYear(year);
                session.persist(b);
            } else {
                Budget b = session.get(Budget.class, editingId);
                b.setCategory(category);
                b.setLimitAmount(limitAmount);
                b.setMonth(month);
                b.setYear(year);
                session.update(b);
            }

            tx.commit();
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_ERROR, "Could not save budget: " + e.getMessage(), null));
            return null;
        } finally {
            session.close();
        }

        clearForm();
        loadBudgets();
        return "budgetList?faces-redirect=true";
    }

    public String editBudget(Budget b) {
        this.editingId = b.getId();
        this.category = b.getCategory();
        this.limitAmount = b.getLimitAmount();
        this.month = b.getMonth();
        this.year = b.getYear();
        return "budgetForm?faces-redirect=true";
    }

    public String deleteBudget(Budget b) {
        Session session = HibernateUtil.getSessionFactory().openSession();
        org.hibernate.Transaction tx = null;
        try {
            tx = session.beginTransaction();
            Budget managed = session.get(Budget.class, b.getId());
            if (managed != null) {
                session.delete(managed);
            }
            tx.commit();
        } catch (Exception e) {
            if (tx != null) tx.rollback();
        } finally {
            session.close();
        }
        loadBudgets();
        return "budgetList?faces-redirect=true";
    }

    public String cancelEdit() {
        clearForm();
        return "budgetForm?faces-redirect=true";
    }

    private void clearForm() {
        editingId = null;
        category = null;
        limitAmount = null;
        month = null;
        year = null;
    }

    public boolean isEditMode() {
        return editingId != null;
    }

    public List<Budget> getBudgets() { return budgets; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getLimitAmount() { return limitAmount; }
    public void setLimitAmount(Double limitAmount) { this.limitAmount = limitAmount; }

    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
}