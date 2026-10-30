package com.productionhouse.crm.finance.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.productionhouse.crm.finance.model.Equipment;
import com.productionhouse.crm.finance.model.EquipmentBooking;
import com.productionhouse.crm.finance.model.EquipmentStatus;
import com.productionhouse.crm.finance.model.Vendor;
import com.productionhouse.crm.finance.repository.EquipmentBookingRepository;
import com.productionhouse.crm.finance.repository.EquipmentRepository;
import com.productionhouse.crm.finance.repository.VendorRepository;

@Service
@Transactional
public class EquipmentService {
	
	@Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;
    
    @Autowired EquipmentBookingRepository equipmentBookingRepository;

	  public Equipment saveEquipment(String vendorId, Equipment equipment) {
	        Vendor vendor = vendorRepository.findById(vendorId)
	                .orElseThrow(() -> new RuntimeException("Vendor not found with ID: " + vendorId));
	        
	        equipment.setVendor(vendor);
	        Equipment savedEquipment = equipmentRepository.save(equipment);
	        
	        if (vendor.getEquipment() != null && vendor.getEquipment().size() >= 1) {
	            vendor.setStatus("ACTIVE");
	            vendorRepository.save(vendor);
	        }
	        return savedEquipment;
	    }
	  
	  public List<Equipment> getAvailableEquipment() {
	        return equipmentRepository.findByStatus(EquipmentStatus.AVAILABLE);
	    }
	  
	  public EquipmentBooking bookEquipment(String projectId, String equipmentId, LocalDate startDate, LocalDate endDate) {
	        if (startDate == null || endDate == null) {
	            throw new IllegalArgumentException("Rental allocation dates cannot be null parameters.");
	        }

	        if (startDate.isBefore(LocalDate.now())) {
	            throw new IllegalArgumentException("Rental start date cannot be scheduled in a past date context.");
	        }

	        if (startDate.isAfter(endDate)) {
	            throw new IllegalArgumentException("Rental timeline mismatch: Start date cannot occur later than the scheduled end date.");
	        }

	        Equipment equipment = equipmentRepository.findById(equipmentId)
	                .orElseThrow(() -> new RuntimeException("Equipment record profile missing for ID: " + equipmentId));

	        if (equipment.getStatus() == EquipmentStatus.MAINTENANCE) {
	            throw new IllegalStateException("Equipment is currently flagged under maintenance logs and cannot be rented.");
	        }

	        List<EquipmentBooking> overlaps = equipmentBookingRepository.findOverlappingBookings(equipmentId, startDate, endDate);
	        if (!overlaps.isEmpty()) {
	            throw new IllegalStateException("Double-booking conflict! This asset is already reserved during the selected timeline window.");
	        }

	        long days = ChronoUnit.DAYS.between(startDate, endDate);
	        if (days == 0) days = 1;
	        BigDecimal totalCost = equipment.getDailyRate().multiply(BigDecimal.valueOf(days));

	        equipment.setStatus(EquipmentStatus.RENTED);
	        equipmentRepository.save(equipment);

	        EquipmentBooking booking = new EquipmentBooking();
	        booking.setProjectId(projectId);
	        booking.setEquipment(equipment);
	        booking.setStartDate(startDate);
	        booking.setEndDate(endDate);
	        booking.setTotalCost(totalCost);

	        return equipmentBookingRepository.save(booking);
	    }

}
