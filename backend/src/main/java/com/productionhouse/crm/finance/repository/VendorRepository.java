package com.productionhouse.crm.finance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.productionhouse.crm.finance.model.Vendor;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, String> {
    List<Vendor> findByCategory(String category);
}
