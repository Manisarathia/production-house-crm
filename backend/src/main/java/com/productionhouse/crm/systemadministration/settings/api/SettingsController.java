package com.productionhouse.crm.systemadministration.settings.api;

import com.productionhouse.crm.auth.security.CurrentUser;
import com.productionhouse.crm.systemadministration.roles.entity.Permission;
import com.productionhouse.crm.systemadministration.settings.api.dto.SettingRequest;
import com.productionhouse.crm.systemadministration.settings.api.dto.SettingResponse;
import com.productionhouse.crm.systemadministration.settings.api.dto.SettingValueRequest;
import com.productionhouse.crm.systemadministration.settings.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {
    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SETTINGS_READ')")
    public List<SettingResponse> list() {
        return settingsService.list();
    }

    @GetMapping("/{key}")
    @PreAuthorize("hasAuthority('SETTINGS_READ')")
    public SettingResponse get(@PathVariable String key) {
        return settingsService.get(key);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('SETTINGS_WRITE')")
    public SettingResponse create(
            @Valid @RequestBody SettingRequest request,
            @AuthenticationPrincipal CurrentUser currentUser
    ) {
        return settingsService.create(request, currentUser);
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasAuthority('SETTINGS_WRITE')")
    public SettingResponse update(
            @PathVariable String key,
            @Valid @RequestBody SettingValueRequest request,
            @AuthenticationPrincipal CurrentUser currentUser
    ) {
        return settingsService.update(key, request.value(), currentUser);
    }

    @DeleteMapping("/{key}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('SETTINGS_WRITE')")
    public void delete(
            @PathVariable String key,
            @AuthenticationPrincipal CurrentUser currentUser
    ) {
        settingsService.delete(key, currentUser);
    }
}
