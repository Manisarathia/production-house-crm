package com.productionhouse.crm.systemadministration.settings.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

@Entity
@Table(name = "crm_system_settings", uniqueConstraints = @UniqueConstraint(name = "uk_crm_setting_key", columnNames = "setting_key"))
public class SystemSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "setting_key", nullable = false, length = 100)
    private String key;

    @Column(name = "setting_value", length = 5500)
    private String value;

    @Column(name = "is_sensitive", nullable = false)
    private boolean sensitive;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected SystemSetting() {
    }

    public SystemSetting(String key, String value, boolean sensitive) {
        this.key = key;
        this.value = value;
        this.sensitive = sensitive;
    }

    public Long getId() {
        return id;
    }

    public String getKey() {
        return key;
    }

    public String getValue() {
        return value;
    }

    public boolean isSensitive() {
        return sensitive;
    }

    public void setValue(String value) {
        this.value = value;
        this.updatedAt = Instant.now();
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
