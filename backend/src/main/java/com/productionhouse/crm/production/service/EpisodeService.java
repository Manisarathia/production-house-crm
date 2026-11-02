package com.productionhouse.crm.production.service;

import com.productionhouse.crm.production.model.*;
import com.productionhouse.crm.production.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;
import com.productionhouse.crm.production.model.EpisodeRequest;

@Service
public class EpisodeService {
	private final EpisodeRepository repo;
	private final MediaItemRepository mediaItemRepository;

	public EpisodeService(EpisodeRepository repo, MediaItemRepository mediaItemRepository) {
		this.repo = repo;
		this.mediaItemRepository = mediaItemRepository;
	}

	@Transactional(readOnly = true)
	public List<Map<String, Object>> all() {
		return repo.findAll().stream().map(EpisodeService::toResponse).toList();
	}

	public ResponseEntity<?> one(String id) {
		return repo.findById(id).map(e -> ResponseEntity.ok((Object) toResponse(e)))
				.orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Not found")));
	}

	private void apply(Episode e, EpisodeRequest r) {
		if (r.mediaItemId == null || r.mediaItemId.isBlank())
			throw new IllegalArgumentException("mediaItemId is required");
		MediaItem mediaItem = mediaItemRepository.findById(r.mediaItemId)
				.orElseThrow(() -> new IllegalArgumentException("Media Item not found: " + r.mediaItemId));
		e.setMediaItem(mediaItem);
		e.setProject(r.project);
		e.setEpisodeNumber(r.episodeNumber);
		e.setTitle(r.title);
		e.setRuntime(r.runtime);
		e.setStatus(r.status);
		e.setDirector(r.director);
		e.setWriter(r.writer);
		e.setTargetAirDate(
				(r.targetAirDate == null || r.targetAirDate.isBlank() ? null : LocalDate.parse(r.targetAirDate)));
		e.setSynopsis(r.synopsis);
		e.setScenesCount(r.scenesCount);
		e.setScenesCompleted(r.scenesCompleted);
	}

	@Transactional
	public ResponseEntity<?> create(EpisodeRequest r) {
		try {
			Episode e = new Episode();
			apply(e, r);
			return ResponseEntity.status(201).body(toResponse(repo.save(e)));
		} catch (Exception ex) {
			return ResponseEntity.badRequest()
					.body(Map.of("error", ex.getMessage() == null ? "Invalid input" : ex.getMessage()));
		}
	}

	@Transactional
	public ResponseEntity<?> update(String id, EpisodeRequest r) {
		Optional<Episode> found = repo.findById(id);
		if (found.isEmpty())
			return ResponseEntity.status(404).body(Map.of("error", "Not found"));
		try {
			Episode e = found.get();
			apply(e, r);
			return ResponseEntity.ok(toResponse(repo.save(e)));
		} catch (Exception ex) {
			return ResponseEntity.badRequest()
					.body(Map.of("error", ex.getMessage() == null ? "Invalid input" : ex.getMessage()));
		}
	}

	@Transactional
	public ResponseEntity<?> delete(String id) {
		if (!repo.existsById(id))
			return ResponseEntity.status(404).body(Map.of("error", "Not found"));
		repo.deleteById(id);
		return ResponseEntity.noContent().build();
	}

	private static Map<String, Object> toResponse(Episode e) {
		Map<String, Object> m = new LinkedHashMap<>();
		m.put("id", e.getId());
		m.put("project", e.getProject());
		m.put("mediaItemId", e.getMediaItem() == null ? null : e.getMediaItem().getId());
		m.put("episodeNumber", e.getEpisodeNumber());
		m.put("title", e.getTitle());
		m.put("runtime", e.getRuntime());
		m.put("status", e.getStatus());
		m.put("director", e.getDirector());
		m.put("writer", e.getWriter());
		m.put("targetAirDate", e.getTargetAirDate());
		m.put("synopsis", e.getSynopsis());
		m.put("scenesCount", e.getScenesCount());
		m.put("scenesCompleted", e.getScenesCompleted());
		return m;
	}
}
