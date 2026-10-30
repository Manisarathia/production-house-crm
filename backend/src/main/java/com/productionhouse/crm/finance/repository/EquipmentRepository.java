package com.productionhouse.crm.finance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.productionhouse.crm.finance.model.Equipment;
import com.productionhouse.crm.finance.model.EquipmentStatus;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, String> {
    List<Equipment> findByStatus(EquipmentStatus status);
    
    List<Equipment> findByVendorId(String vendorId);
    
    @Query("SELECT e FROM Equipment e JOIN FETCH e.vendor")
    List<Equipment> findAllWithVendor();
    
}
