package com.productionhouse.crm.systemadministration.settings.service;

import com.productionhouse.crm.auth.api.ApiException;
import com.productionhouse.crm.auth.security.CurrentUser;
import com.productionhouse.crm.systemadministration.roles.entity.Permission;
import com.productionhouse.crm.systemadministration.settings.api.dto.SettingRequest;
import com.productionhouse.crm.systemadministration.settings.api.dto.SettingResponse;
import com.productionhouse.crm.systemadministration.settings.entity.SystemSetting;
import com.productionhouse.crm.systemadministration.settings.repository.SettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.DateTimeException;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class SettingsService {
    private static final Set<String> CURRENCIES = Set.of("INR", "USD", "EUR");
    private static final Set<String> BOOLEAN_SETTINGS = Set.of(
            "allowProjectCreation", "requireExpenseApproval", "weeklyProductionSummary",
            "emailNotifications", "deadlineReminders", "invoicePaymentUpdates",
            "twoFactorAuthentication", "sessionTimeout", "compactInterface", "showDashboardTips",
            "blueAccentColor"
    );
    private static final Set<String> PUBLIC_SETTING_KEYS = Set.of(
            "workspace.name", "workspace.url", "workspace.timezone", "workspace.currency",
            "allowprojectcreation", "requireexpenseapproval", "weeklyproductionsummary",
            "emailnotifications", "deadlinereminders", "invoicepaymentupdates",
            "twofactorauthentication", "sessiontimeout", "compactinterface",
            "showdashboardtips", "blueaccentcolor"
    );

    private final SettingRepository settingRepository;
    private final SettingsEncryptionService encryptionService;

    public SettingsService(SettingRepository settingRepository, SettingsEncryptionService encryptionService) {
        this.settingRepository = settingRepository;
        this.encryptionService = encryptionService;
    }

    @Transactional(readOnly = true)
    public List<SettingResponse> list() {
        return settingRepository.findAll().stream()
                .sorted(java.util.Comparator.comparing(SystemSetting::getKey, String.CASE_INSENSITIVE_ORDER))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SettingResponse get(String key) {
        return toResponse(findSetting(normalizeKey(key)));
    }

    @Transactional
    public SettingResponse create(SettingRequest request, CurrentUser actor) {
        String key = normalizeKey(request.key());
        validateValue(key, request.value());
        if (settingRepository.existsByKeyIgnoreCase(key)) {
            throw ApiException.conflict("A setting with this key already exists.");
        }
        boolean sensitive = request.sensitive();
        if (!sensitive && !PUBLIC_SETTING_KEYS.contains(key.toLowerCase(Locale.ROOT))) {
            throw ApiException.badRequest("Unrecognized settings must be classified as sensitive.");
        }
        requireSensitivePermission(sensitive, actor);
        String value = sensitive ? encryptionService.encrypt(request.value()) : request.value();
        return toResponse(settingRepository.save(new SystemSetting(key, value, sensitive)));
    }

    @Transactional
    public SettingResponse update(String key, String value, CurrentUser actor) {
        String normalizedKey = normalizeKey(key);
        validateValue(normalizedKey, value);
        SystemSetting setting = findSetting(normalizedKey);
        requireSensitivePermission(setting.isSensitive(), actor);
        setting.setValue(setting.isSensitive() ? encryptionService.encrypt(value) : value);
        return toResponse(setting);
    }

    @Transactional
    public void delete(String key, CurrentUser actor) {
        SystemSetting setting = findSetting(normalizeKey(key));
        requireSensitivePermission(setting.isSensitive(), actor);
        settingRepository.delete(setting);
    }

    private SystemSetting findSetting(String key) {
        return settingRepository.findByKeyIgnoreCase(key)
                .orElseThrow(() -> ApiException.notFound("Setting not found."));
    }

    private SettingResponse toResponse(SystemSetting setting) {
        return new SettingResponse(
                setting.getKey(),
                setting.isSensitive() ? null : setting.getValue(),
                setting.isSensitive(),
                setting.getUpdatedAt()
        );
    }

    private String normalizeKey(String key) {
        String normalized = key == null ? "" : key.trim();
        if (!normalized.matches("[A-Za-z][A-Za-z0-9._-]{1,99}")) {
            throw ApiException.badRequest("Setting keys must start with a letter and contain only letters, numbers, dots, underscores, or hyphens.");
        }
        return normalized;
    }

    private void requireSensitivePermission(boolean sensitive, CurrentUser actor) {
        if (sensitive && !actor.hasPermission(Permission.SETTINGS_SENSITIVE_WRITE)) {
            throw ApiException.forbidden("Sensitive settings require SETTINGS_SENSITIVE_WRITE.");
        }
    }

    private void validateValue(String key, String value) {
        if (value == null || value.length() > 2000) {
            throw ApiException.badRequest("Setting value must be provided and no longer than 2000 characters.");
        }
        String lowerKey = key.toLowerCase(Locale.ROOT);
        String normalized = value.trim();
        if (lowerKey.endsWith("workspace.name") && (normalized.isEmpty() || normalized.length() > 120)) {
            throw ApiException.badRequest("Workspace name must contain between 1 and 120 characters.");
        }
        if (BOOLEAN_SETTINGS.stream().anyMatch(name -> name.equalsIgnoreCase(key))
                && !normalized.equalsIgnoreCase("true") && !normalized.equalsIgnoreCase("false")) {
            throw ApiException.badRequest("This setting requires a true or false value.");
        }
        if (lowerKey.endsWith("currency") && !CURRENCIES.contains(normalized.toUpperCase(Locale.ROOT))) {
            throw ApiException.badRequest("Currency must be INR, USD, or EUR.");
        }
        if (lowerKey.endsWith("timezone")) {
            try {
                ZoneId.of(normalized);
            } catch (DateTimeException exception) {
                throw ApiException.badRequest("Timezone must be a valid IANA timezone identifier.");
            }
        }
        if ((lowerKey.endsWith("url") || lowerKey.endsWith("slug"))
                && !normalized.matches("[A-Za-z0-9][A-Za-z0-9-]{0,62}")) {
            throw ApiException.badRequest("Workspace URL must contain only letters, numbers, and hyphens.");
        }
        if (lowerKey.endsWith("sessiontimeoutminutes")) {
            try {
                int minutes = Integer.parseInt(normalized);
                if (minutes < 1 || minutes > 1440) {
                    throw ApiException.badRequest("Session timeout must be between 1 and 1440 minutes.");
                }
            } catch (NumberFormatException exception) {
                throw ApiException.badRequest("Session timeout must be a number of minutes.");
            }
        }
    }
}
