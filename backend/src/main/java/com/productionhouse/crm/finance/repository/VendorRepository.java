package com.productionhouse.crm.finance.repository;

import com.productionhouse.crm.finance.model.Vendor;
import com.productionhouse.crm.finance.model.VendorCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, String> {
    List<Vendor> findByCategory(VendorCategory category);
}
