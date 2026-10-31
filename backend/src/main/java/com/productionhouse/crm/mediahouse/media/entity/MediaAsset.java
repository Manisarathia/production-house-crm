package com.productionhouse.crm.mediahouse.media.entity;

import com.productionhouse.crm.task5.entity.Task5RecordBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "crm_media_media", indexes = {
        @Index(name = "ix_crm_media_asset_project", columnList = "project_ref"),
        @Index(name = "ix_crm_media_asset_type_status", columnList = "type,status")
})
@Getter
@Setter
@NoArgsConstructor
public class MediaAsset extends Task5RecordBase {
    @Column(name = "type", length = 80)
    private String assetType;

    @Column(name = "storage_reference", length = 500)
    private String storageReference;

    @Column(name = "file_format", length = 40)
    private String format;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "duration_seconds")
    private Long durationSeconds;
}
