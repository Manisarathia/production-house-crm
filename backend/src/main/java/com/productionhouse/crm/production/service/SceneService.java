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
public class SceneService {
	
	private final SceneRepository sceneRepository;

	public SceneService(SceneRepository sceneRepository) {
		this.sceneRepository = sceneRepository;
	}

	@Transactional(readOnly = true)
	public List<Scene> all() {
		return sceneRepository.findAll();
	}

	@Transactional(readOnly = true)
	public Scene one(String id) {
		return sceneRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Scene not found"));
	}

	private void apply(Scene scene, SceneRequest sceneRequest) {
		scene.setProject(sceneRequest.project);
		scene.setEpisodeId(sceneRequest.episodeId);
		scene.setEpisodeName(sceneRequest.episodeName);
		scene.setSceneNumber(sceneRequest.sceneNumber);
		scene.setHeading(sceneRequest.heading);
		scene.setSetting(sceneRequest.setting);
		scene.setTimeOfDay(sceneRequest.timeOfDay);
		scene.setPages(sceneRequest.pages);
		scene.setLocation(sceneRequest.location);
		scene.setCharacters(sceneRequest.characters);
		scene.setStatus(sceneRequest.status);
		scene.setShootDate((sceneRequest.shootDate == null || sceneRequest.shootDate.isBlank() ? null : LocalDate.parse(sceneRequest.shootDate)));
		scene.setEquipment(sceneRequest.equipment);
		scene.setDescription(sceneRequest.description);
	}

	@Transactional
	public Scene create(SceneRequest request) {
		try {
			Scene record = new Scene();
			apply(record, request);
			return sceneRepository.save(record);
		} catch (IllegalArgumentException ex) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
		}
	}

	@Transactional
	public Scene update(String id, SceneRequest request) {
		Scene record = one(id);
		try {
			apply(record, request);
			return sceneRepository.save(record);
		} catch (IllegalArgumentException ex) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
		}
	}

	@Transactional
	public void delete(String id) {
		if (!sceneRepository.existsById(id))
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Scene not found");
		sceneRepository.deleteById(id);
	}
}
