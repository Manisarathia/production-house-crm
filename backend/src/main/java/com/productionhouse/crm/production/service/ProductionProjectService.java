package com.productionhouse.crm.production.service;

import com.productionhouse.crm.production.model.*;
import com.productionhouse.crm.production.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.LocalDate;
import java.util.*;

@Service
public class ProductionProjectService {
	
	private final ProjectRepository projectRepository;

	public ProductionProjectService(ProjectRepository projectRepository) {
		this.projectRepository = projectRepository;
	}

	@Transactional(readOnly = true)
	public List<Project> all() {
		return projectRepository.findAll();
	}

	@Transactional(readOnly = true)
	public Project one(String id) {
		return projectRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
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
	public Project create(ProjectRequest request) {
		try {
			Project record = new Project();
			if (request.title == null || request.title.isBlank())
				throw new IllegalArgumentException("Title required");
			apply(record, request);
			return projectRepository.save(record);
		} catch (IllegalArgumentException ex) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
		}
	}

	@Transactional
	public Project update(String id, ProjectRequest request) {
		Project record = one(id);
		try {
			if (request.title == null || request.title.isBlank())
				throw new IllegalArgumentException("Title required");
			apply(record, request);
			return projectRepository.save(record);
		} catch (IllegalArgumentException ex) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
		}
	}

	@Transactional
	public void delete(String id) {
		if (!projectRepository.existsById(id))
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
		projectRepository.deleteById(id);
	}
}
