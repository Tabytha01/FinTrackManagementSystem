package rw.ac.auca.fintrackmanagementsystem.repository;

import rw.ac.auca.fintrackmanagementsystem.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByParentIsNull();
}