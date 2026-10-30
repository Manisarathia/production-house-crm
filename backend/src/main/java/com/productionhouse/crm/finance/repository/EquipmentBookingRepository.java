package com.productionhouse.crm.finance.repository;

import com.productionhouse.crm.finance.model.EquipmentBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EquipmentBookingRepository extends JpaRepository<EquipmentBooking, String> {
    
    List<EquipmentBooking> findByProjectId(String projectId);

    @Query("SELECT b FROM EquipmentBooking b WHERE b.equipment.id = :equipmentId " +
           "AND (:startDate <= b.endDate AND :endDate >= b.startDate)")
    List<EquipmentBooking> findOverlappingBookings(
        @Param("equipmentId") String equipmentId, 
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );
}
