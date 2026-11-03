package com.productionhouse.crm.production.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.productionhouse.crm.production.model.CrewMember;
import com.productionhouse.crm.production.model.CrewMemberRequest;
import com.productionhouse.crm.production.repository.CrewMemberRepository;
import com.productionhouse.crm.production.repository.MediaItemRepository;

@Service
public class CrewMemberService {
	private final CrewMemberRepository crewMemberRepository;
	private final MediaItemRepository mediaRepository;

	public CrewMemberService(CrewMemberRepository crewMemberRepository, MediaItemRepository mediaRepository) {
		this.crewMemberRepository = crewMemberRepository;
		this.mediaRepository = mediaRepository;
	}

	@Transactional(readOnly = true)
	public List<CrewMember> all() {
		return crewMemberRepository.findAll();
	}

	@Transactional(readOnly = true)
	public CrewMember one(String id) {
		return crewMemberRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CrewMember not found"));
	}

	private void apply(CrewMember crewMember, CrewMemberRequest crewMemberRequest) {
		crewMember.setName(crewMemberRequest.name.trim());
		crewMember.setCategory(crewMemberRequest.category);
		crewMember.setDepartment(crewMemberRequest.department);
		crewMember.setRole(crewMemberRequest.role);
		crewMember.setProject(crewMemberRequest.project);
		crewMember.setEmail(crewMemberRequest.email);
		crewMember.setPhone(crewMemberRequest.phone);
		crewMember.setRate(crewMemberRequest.rate);
		crewMember.setRateType(crewMemberRequest.rateType);
		crewMember.setStatus(crewMemberRequest.status);
		crewMember.setGuild(crewMemberRequest.guild);
		crewMember.setContractStatus(crewMemberRequest.contractStatus);
		crewMember.setAgent(crewMemberRequest.agent);
		crewMember.setDaysBooked(crewMemberRequest.daysBooked);
		crewMember.setDietaryNotes(crewMemberRequest.dietaryNotes);
		crewMember.setTone(crewMemberRequest.tone);
        if (crewMemberRequest.memberImage == null || crewMemberRequest.memberImage.isBlank())
            throw new IllegalArgumentException("Member Image is required");
        String image = crewMemberRequest.memberImage.trim();
        if (!image.matches("(?s)^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$"))
            throw new IllegalArgumentException("Member Image must be a JPG, PNG or WebP image");
        if (image.length() > 8_000_000)
            throw new IllegalArgumentException("Member Image is too large");
        crewMember.setMemberImage(image);
		if (crewMemberRequest.mediaItemId == null || crewMemberRequest.mediaItemId.isBlank())
			crewMember.setMediaItem(null);
		else
			crewMember.setMediaItem(mediaRepository.findById(crewMemberRequest.mediaItemId)
					.orElseThrow(() -> new IllegalArgumentException("Media item not found")));
	}

	@Transactional
	public CrewMember create(CrewMemberRequest crewMemberRequest) {
		try {
			CrewMember record = new CrewMember();
			if (crewMemberRequest.name == null || crewMemberRequest.name.isBlank())
				throw new IllegalArgumentException("Name required");
			apply(record, crewMemberRequest);
			return crewMemberRepository.save(record);
		} catch (IllegalArgumentException ex) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
		}
	}

	@Transactional
	public CrewMember update(String id, CrewMemberRequest request) {
		CrewMember record = one(id);
		try {
			if (request.name == null || request.name.isBlank())
				throw new IllegalArgumentException("Name required");
			apply(record, request);
			return crewMemberRepository.save(record);
		} catch (IllegalArgumentException ex) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
		}
	}

	@Transactional
	public void delete(String id) {
		if (!crewMemberRepository.existsById(id))
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CrewMember not found");
		crewMemberRepository.deleteById(id);
	}
}
