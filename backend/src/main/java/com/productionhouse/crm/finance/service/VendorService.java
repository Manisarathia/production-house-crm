package com.productionhouse.crm.finance.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.productionhouse.crm.finance.model.Vendor;
import com.productionhouse.crm.finance.repository.VendorRepository;

@Service
@Transactional
public class VendorService {

    @Autowired
    private VendorRepository vendorRepository;

    public Vendor saveVendor(Vendor vendor) {
        return vendorRepository.save(vendor);
    }

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

	public Optional<Vendor> findById(String vendorId) {
		return vendorRepository.findById(vendorId);
	}
}
