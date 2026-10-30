package com.productionhouse.crm.finance.repository;

import com.productionhouse.crm.finance.model.Expense;
import com.productionhouse.crm.finance.model.ExpenseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, String> {
    
    @Query("SELECT e FROM Expense e WHERE e.project.id = :projectId")
    List<Expense> findByProjectId(@Param("projectId") String projectId);
    
    @Query("SELECT e FROM Expense e WHERE e.project.id = :projectId AND e.status = :status")
    List<Expense> findByProjectIdAndStatus(@Param("projectId") String projectId, @Param("status") ExpenseStatus status);

    @Query("SELECT e FROM Expense e JOIN FETCH e.project WHERE e.project.id = :projectId")
    List<Expense> findByProjectIdWithProject(@Param("projectId") String projectId);
}
