package com.productionhouse.crm.production.controller;

import com.productionhouse.crm.production.model.EpisodeRequest;
import com.productionhouse.crm.production.service.EpisodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/production/episodes")
@CrossOrigin(origins = "*")
public class EpisodeController {
	private final EpisodeService episodeService;

	public EpisodeController(EpisodeService episodeService) {
		this.episodeService = episodeService;
	}

	@GetMapping
	public ResponseEntity<List<Map<String, Object>>> all() {
		return ResponseEntity.ok(episodeService.all());
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> one(@PathVariable String id) {
		return episodeService.one(id);
	}

	@PostMapping
	public ResponseEntity<?> create(@RequestBody EpisodeRequest request) {
		return episodeService.create(request);
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable String id, @RequestBody EpisodeRequest request) {
		return episodeService.update(id, request);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> delete(@PathVariable String id) {
		return episodeService.delete(id);
	}
}
