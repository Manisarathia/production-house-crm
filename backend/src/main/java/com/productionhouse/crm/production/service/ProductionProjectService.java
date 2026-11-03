package com.productionhouse.crm.production.service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.productionhouse.crm.production.model.ProductionStage;
import com.productionhouse.crm.production.model.Project;
import com.productionhouse.crm.production.model.ProjectRequest;
import com.productionhouse.crm.production.model.ProjectType;
import com.productionhouse.crm.production.repository.ProjectRepository;

@Service
public class ProductionProjectService {
	private final ProjectRepository repo;
	private final JdbcTemplate jdbc;

	public ProductionProjectService(ProjectRepository repo, JdbcTemplate jdbc) {
		this.repo = repo;
		this.jdbc = jdbc;
	}

	@Transactional(readOnly = true)
	public List<Map<String, Object>> all() {
		return repo.findAll().stream().map(ProductionProjectService::toResponse).toList();
	}

	public ResponseEntity<Map<String, Object>> one(String id) {
		return repo.findById(id).map(p -> ResponseEntity.ok(toResponse(p)))
				.orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Project not found")));
	}

	private void apply(Project p, ProjectRequest r) {
		p.setTitle(r.title.trim());
		p.setType(ProjectType.valueOf(r.type));
		p.setStage(ProductionStage.valueOf(r.stage == null ? "PRE_PRODUCTION" : r.stage));
		p.setStartDate(LocalDate.parse(r.startDate));
		p.setEndDate(r.endDate == null || r.endDate.isBlank() ? null : LocalDate.parse(r.endDate));
		p.setPosterUrl(r.posterUrl);
		if (p.getEndDate() != null && p.getEndDate().isBefore(p.getStartDate()))
			throw new IllegalArgumentException("End date must be after start date");
	}

	@Transactional
	public ResponseEntity<Map<String, Object>> create(ProjectRequest r) {
		try {
			Project p = new Project();
			apply(p, r);
			return ResponseEntity.status(201).body(toResponse(repo.save(p)));
		} catch (Exception e) {
			return ResponseEntity.badRequest()
					.body(Map.of("error", e.getMessage() == null ? "Invalid project" : e.getMessage()));
		}
	}

	@Transactional
	public ResponseEntity<Map<String, Object>> update(String id, ProjectRequest r) {
		Optional<Project> found = repo.findById(id);
		if (found.isEmpty())
			return ResponseEntity.status(404).body(Map.of("error", "Project not found"));
		try {
			Project p = found.get();
			apply(p, r);
			return ResponseEntity.ok(toResponse(repo.save(p)));
		} catch (Exception e) {
			return ResponseEntity.badRequest()
					.body(Map.of("error", e.getMessage() == null ? "Invalid project" : e.getMessage()));
		}
	}

	@Transactional
	public ResponseEntity<Map<String, Object>> delete(String id) {
		Project project = repo.findById(id).orElse(null);
		if (project == null) return ResponseEntity.status(404).body(Map.of("error", "Project not found"));

		// Legacy scene/episode/crew tables store the project title as plain text.
		// Refuse ambiguous titles to avoid deleting another project's records.
		String title = project.getTitle();
		Integer sameTitleCount = jdbc.queryForObject(
				"SELECT COUNT(*) FROM projects WHERE title = ?", Integer.class, title);
		if (sameTitleCount != null && sameTitleCount > 1) {
			return ResponseEntity.status(409).body(Map.of("error",
					"Multiple projects share this title. Resolve duplicate project titles before cascading deletion."));
		}

		// Delete children before parents. @Transactional rolls back on SQL exceptions.
		jdbc.update("DELETE p FROM payments p JOIN invoices i ON p.invoice_id = i.id WHERE i.project_id = ?", id);
		jdbc.update("DELETE FROM invoices WHERE project_id = ?", id);
		jdbc.update("DELETE FROM equipment_bookings WHERE project_id = ?", id);
		jdbc.update("DELETE FROM expenses WHERE project_id = ?", id);
		jdbc.update("DELETE FROM budgets WHERE project_id = ?", id);

		// Delete scenes linked to episodes of this project, including title-only episodes.
		jdbc.update("DELETE s FROM production_scenes s JOIN production_episodes e ON s.episode_id = e.id "
				+ "LEFT JOIN media_items m ON e.media_item_id = m.id "
				+ "WHERE m.project_id = ? OR e.project = ? OR e.project = ?", id, id, title);
		// Standalone scenes may have no episode reference.
		jdbc.update("DELETE FROM production_scenes WHERE project = ? OR project = ?", id, title);
		jdbc.update("DELETE FROM production_crew_members WHERE project = ? OR project = ? "
				+ "OR media_item_id IN (SELECT id FROM media_items WHERE project_id = ?)", id, title, id);
		jdbc.update("DELETE FROM project_cast_crew WHERE media_item_id IN "
				+ "(SELECT id FROM media_items WHERE project_id = ?)", id);
		jdbc.update("DELETE FROM production_episodes WHERE project = ? OR project = ? "
				+ "OR media_item_id IN (SELECT id FROM media_items WHERE project_id = ?)", id, title, id);
		jdbc.update("DELETE FROM media_items WHERE project_id = ?", id);
		int deleted = jdbc.update("DELETE FROM projects WHERE id = ?", id);
		if (deleted != 1) throw new IllegalStateException("Project deletion did not affect exactly one row");
		return ResponseEntity.ok(Map.of("message", "Project and linked records deleted successfully"));
	}

	private static Map<String, Object> toResponse(Project p) {
		Map<String, Object> m = new LinkedHashMap<>();
		m.put("id", p.getId());
		m.put("title", p.getTitle());
		m.put("type", p.getType());
		m.put("stage", p.getStage());
		m.put("startDate", p.getStartDate());
		m.put("endDate", p.getEndDate());
		m.put("posterUrl", p.getPosterUrl());
		return m;
	}
}
