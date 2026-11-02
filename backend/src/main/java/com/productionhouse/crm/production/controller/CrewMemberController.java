package com.productionhouse.crm.production.controller;

import com.productionhouse.crm.production.model.CrewMember;
import com.productionhouse.crm.production.model.CrewMemberRequest;
import com.productionhouse.crm.production.service.CrewMemberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/production/crew")
@CrossOrigin(origins = "*")
public class CrewMemberController {

	private final CrewMemberService crewMemberService;

	public CrewMemberController(CrewMemberService crewMemberService) {
		this.crewMemberService = crewMemberService;
	}

	@GetMapping
	public ResponseEntity<List<CrewMember>> all() {
		return ResponseEntity.ok(crewMemberService.all());
	}

	@GetMapping("/{id}")
	public ResponseEntity<CrewMember> one(@PathVariable String id) {
		return ResponseEntity.ok(crewMemberService.one(id));
	}

	@PostMapping
	public ResponseEntity<CrewMember> create(@RequestBody CrewMemberRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(crewMemberService.create(request));
	}

	@PutMapping("/{id}")
	public ResponseEntity<CrewMember> update(@PathVariable String id, @RequestBody CrewMemberRequest request) {
		return ResponseEntity.ok(crewMemberService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable String id) {
		crewMemberService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
