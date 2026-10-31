package com.productionhouse.crm.controller;

import com.productionhouse.crm.model.BaseEntity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * One generic controller used by all 9 modules.
 * Every response is wrapped as { "data": ... } because the React client unwraps it.
 */
public abstract class CrudController<T extends BaseEntity> {

    @PersistenceContext
    protected EntityManager em;

    private final Class<T> type;

    protected CrudController(Class<T> type) { this.type = type; }

    @GetMapping
    @Transactional(readOnly = true)
    public Map<String, Object> list() {
        List<T> rows = em.createQuery(
                "select e from " + type.getSimpleName() + " e order by e.createdAt desc, e.id desc", type)
                .getResultList();
        return Map.of("data", rows);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Map<String, Object> create(@Valid @RequestBody T body) {
        body.setId(null);
        em.persist(body);
        return Map.of("data", body);
    }

    @PutMapping("/{id}")
    @Transactional
    public Map<String, Object> update(@PathVariable Long id, @Valid @RequestBody T body) {
        T existing = em.find(type, id);
        if (existing == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found");
        body.setId(id);
        body.setCreatedAt(existing.getCreatedAt());
        return Map.of("data", em.merge(body));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public Map<String, Object> delete(@PathVariable Long id) {
        T existing = em.find(type, id);
        if (existing == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found");
        em.remove(existing);
        return Map.of("data", Map.of("id", id));
    }
}
