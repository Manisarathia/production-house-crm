package com.productionhouse.crm.production.controller;

import com.productionhouse.crm.production.model.MediaItem;
import com.productionhouse.crm.production.model.MediaItemRequest;
import com.productionhouse.crm.production.service.MediaItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/production/media-items")
@CrossOrigin(origins = "*")
public class MediaItemController {
	
	private final MediaItemService mediaItemService;

	public MediaItemController(MediaItemService service) {
		this.mediaItemService = service;
	}

	@GetMapping
	public ResponseEntity<List<MediaItem>> all() {
		return ResponseEntity.ok(mediaItemService.all());
	}

	@GetMapping("/{id}")
	public ResponseEntity<MediaItem> one(@PathVariable String id) {
		return ResponseEntity.ok(mediaItemService.one(id));
	}

	@PostMapping
	public ResponseEntity<MediaItem> create(@RequestBody MediaItemRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(mediaItemService.create(request));
	}

	@PutMapping("/{id}")
	public ResponseEntity<MediaItem> update(@PathVariable String id, @RequestBody MediaItemRequest request) {
		return ResponseEntity.ok(mediaItemService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable String id) {
		mediaItemService.delete(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/project/{projectId}")
	public ResponseEntity<List<MediaItem>> getMediaItemsByProject(@PathVariable String projectId) {
		return ResponseEntity.ok(mediaItemService.getMediaItemsByProject(projectId));
	}
}
