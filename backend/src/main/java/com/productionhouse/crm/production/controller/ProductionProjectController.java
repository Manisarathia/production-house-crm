package com.productionhouse.crm.production.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.productionhouse.crm.production.model.ProjectRequest;
import com.productionhouse.crm.production.service.ProductionProjectService;

@RestController
@RequestMapping("/api/production/projects")
@CrossOrigin(origins = "*")
public class ProductionProjectController {

	private final ProductionProjectService productionProjectService;

	public ProductionProjectController(ProductionProjectService productionProjectService) {
		this.productionProjectService = productionProjectService;
	}

	@GetMapping
	public ResponseEntity<List<Map<String, Object>>> all() {
		return ResponseEntity.ok(productionProjectService.all());
	}

	@GetMapping("/{id}")
	public ResponseEntity<ResponseEntity<Map<String, Object>>> one(@PathVariable String id) {
		return ResponseEntity.ok(productionProjectService.one(id));
	}

	@PostMapping
	public ResponseEntity<ResponseEntity<Map<String, Object>>> create(@RequestBody ProjectRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(productionProjectService.create(request));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ResponseEntity<Map<String, Object>>> update(@PathVariable String id,
			@RequestBody ProjectRequest request) {
		return ResponseEntity.ok(productionProjectService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Map<String, Object>> delete(@PathVariable String id) {
		return productionProjectService.delete(id);
	}
}
