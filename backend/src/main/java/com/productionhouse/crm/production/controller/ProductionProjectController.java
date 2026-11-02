package com.productionhouse.crm.production.controller;

import com.productionhouse.crm.production.model.Project;
import com.productionhouse.crm.production.model.ProjectRequest;
import com.productionhouse.crm.production.service.ProductionProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/production/projects")
@CrossOrigin(origins = "*")
public class ProductionProjectController {
	
	private final ProductionProjectService productionProjectService;

	public ProductionProjectController(ProductionProjectService productionProjectService) {
		this.productionProjectService = productionProjectService;
	}

	@GetMapping
	public ResponseEntity<List<Project>> all() {
		return ResponseEntity.ok(productionProjectService.all());
	}

	@GetMapping("/{id}")
	public ResponseEntity<Project> one(@PathVariable String id) {
		return ResponseEntity.ok(productionProjectService.one(id));
	}

	@PostMapping
	public ResponseEntity<Project> create(@RequestBody ProjectRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(productionProjectService.create(request));
	}

	@PutMapping("/{id}")
	public ResponseEntity<Project> update(@PathVariable String id, @RequestBody ProjectRequest request) {
		return ResponseEntity.ok(productionProjectService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable String id) {
		productionProjectService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
