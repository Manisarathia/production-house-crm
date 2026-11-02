package com.productionhouse.crm.production.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.productionhouse.crm.production.model.MediaItem;
import com.productionhouse.crm.production.model.MediaItemRequest;
import com.productionhouse.crm.production.model.Project;
import com.productionhouse.crm.production.repository.MediaItemRepository;
import com.productionhouse.crm.production.repository.ProjectRepository;

@Service
public class MediaItemService {
	
	private final MediaItemRepository media;
	private final ProjectRepository projects;

	public MediaItemService(MediaItemRepository media, ProjectRepository projects) {
		this.media = media;
		this.projects = projects;
	}

	private Project findProject(String name) {
		return projects.findAll().stream().filter(p -> p.getId().equals(name) || p.getTitle().equalsIgnoreCase(name))
				.findFirst().orElseThrow(() -> new IllegalArgumentException("Associated project not found"));
	}

	@Transactional(readOnly = true)
	public List<MediaItem> all() {
		return media.findAll();
	}

	@Transactional(readOnly = true)
	public MediaItem one(String id) {
		return media.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "MediaItem not found"));
	}

	@Transactional(readOnly = true)
	public List<MediaItem> getMediaItemsByProject(String projectId) {
		return media.findByProjectId(projectId);
	}

	private void apply(MediaItem m, MediaItemRequest r) {
		if (r.title == null || r.title.isBlank())
			throw new IllegalArgumentException("Title required");
		if (r.associatedProject == null || r.associatedProject.isBlank())
			throw new IllegalArgumentException("Associated project required");
		m.setTitle(r.title.trim());
		m.setSeasonNumber(r.seasonNumber);
		m.setProject(findProject(r.associatedProject));
		if (r.posterUrl != null)
			m.setPosterUrl(r.posterUrl);
	}

	@Transactional
	public MediaItem create(MediaItemRequest request) {
		try {
			MediaItem record = new MediaItem();
			apply(record, request);
			return media.save(record);
		} catch (IllegalArgumentException ex) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
		}
	}

	@Transactional
	public MediaItem update(String id, MediaItemRequest request) {
		MediaItem record = one(id);
		try {
			apply(record, request);
			return media.save(record);
		} catch (IllegalArgumentException ex) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
		}
	}

	@Transactional
	public void delete(String id) {
		if (!media.existsById(id))
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "MediaItem not found");
		media.deleteById(id);
	}
}
