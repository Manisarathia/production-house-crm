package com.productionhouse.crm.production.controller;

import com.productionhouse.crm.production.model.Scene;
import com.productionhouse.crm.production.model.SceneRequest;
import com.productionhouse.crm.production.service.SceneService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/production/scenes")
@CrossOrigin(origins = "*")
public class SceneController {
	
	private final SceneService sceneService;

	public SceneController(SceneService sceneService) {
		this.sceneService = sceneService;
	}

	@GetMapping
	public ResponseEntity<List<Scene>> all() {
		return ResponseEntity.ok(sceneService.all());
	}

	@GetMapping("/{id}")
	public ResponseEntity<Scene> one(@PathVariable String id) {
		return ResponseEntity.ok(sceneService.one(id));
	}

	@PostMapping
	public ResponseEntity<Scene> create(@RequestBody SceneRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(sceneService.create(request));
	}

	@PutMapping("/{id}")
	public ResponseEntity<Scene> update(@PathVariable String id, @RequestBody SceneRequest request) {
		return ResponseEntity.ok(sceneService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable String id) {
		sceneService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
