package com.productionhouse.crm.finance.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.productionhouse.crm.finance.model.Equipment;
import com.productionhouse.crm.finance.model.EquipmentBooking;
import com.productionhouse.crm.finance.model.EquipmentStatus;
import com.productionhouse.crm.finance.model.Vendor;
import com.productionhouse.crm.finance.model.VendorCategory;
import com.productionhouse.crm.finance.repository.EquipmentRepository;
import com.productionhouse.crm.finance.repository.VendorRepository;
import com.productionhouse.crm.finance.service.EquipmentService;
import com.productionhouse.crm.finance.service.VendorService;

@RestController
@RequestMapping("/api/finance/vendors")
@CrossOrigin(origins = "*",
methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PATCH, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
) 
public class VendorController {

    @Autowired
    private VendorService vendorService;
    
    @Autowired
    private EquipmentService equipmentService;
    
    @Autowired
    private EquipmentRepository equipmentRepository;
    
    @Autowired
    private VendorRepository vendorRepository;

    @PostMapping
    public ResponseEntity<Vendor> createVendor(@RequestBody Vendor vendor) {
        return ResponseEntity.ok(vendorService.saveVendor(vendor));
    }

    @GetMapping
    public ResponseEntity<List<Vendor>> getAllVendors() {
        return ResponseEntity.ok(vendorService.getAllVendors());
    }

    @GetMapping("/categories")
    public ResponseEntity<VendorCategory[]> getVendorCategories() {
        return ResponseEntity.ok(VendorCategory.values());
    }

    
    @GetMapping("/equipment")
    public ResponseEntity<List<Equipment>> getAllEquipment() {
    	 return ResponseEntity.ok(equipmentRepository.findAllWithVendor());
    }
    
    @PostMapping("/{vendorId}/equipment")
    public ResponseEntity<Equipment> addEquipmentToVendor(
            @PathVariable String vendorId, 
            @RequestBody Equipment equipment) {
        return ResponseEntity.ok(equipmentService.saveEquipment(vendorId, equipment));
    }

    @GetMapping("/equipment/available")
    public ResponseEntity<List<Equipment>> getAvailableEquipment() {
        return ResponseEntity.ok(equipmentService.getAvailableEquipment());
    }

    @PostMapping("/equipment/book")
    public ResponseEntity<EquipmentBooking> bookEquipment(@RequestBody Map<String, Object> payload) {
        String projectId = (String) payload.get("projectId");
        String equipmentId = (String) payload.get("equipmentId");
        LocalDate startDate = LocalDate.parse((String) payload.get("startDate"));
        LocalDate endDate = LocalDate.parse((String) payload.get("endDate"));
        
        EquipmentBooking booking = equipmentService.bookEquipment(projectId, equipmentId, startDate, endDate);
        return ResponseEntity.ok(booking);
    }
    
    @PatchMapping("/equipment/{equipmentId}/status")
    public ResponseEntity<?> updateEquipmentStatus(
            @PathVariable String equipmentId, 
            @RequestParam EquipmentStatus status) {
        
        return equipmentRepository.findById(equipmentId).map(eq -> {
            eq.setStatus(status);
            com.productionhouse.crm.finance.model.Equipment updated = equipmentRepository.save(eq);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{vendorId}")
    public ResponseEntity<?> deleteVendor(@PathVariable String vendorId) {
        return vendorService.findById(vendorId).map(v -> {
            vendorRepository.delete(v);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/equipment/{equipmentId}")
    public ResponseEntity<?> deleteEquipment(@PathVariable String equipmentId) {
        return equipmentRepository.findById(equipmentId).map(eq -> {
            Vendor vendor = eq.getVendor();
            equipmentRepository.delete(eq);
            
            if (vendor != null) {
                Vendor currentVendor = vendorService.findById(vendor.getId()).orElse(vendor);
                if (currentVendor.getEquipment() == null || currentVendor.getEquipment().isEmpty()) {
                    currentVendor.setStatus("INACTIVE");
                    vendorRepository.save(currentVendor);
                }
            }
            
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

}
