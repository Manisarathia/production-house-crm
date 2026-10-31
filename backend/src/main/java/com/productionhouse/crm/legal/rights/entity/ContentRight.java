package com.productionhouse.crm.legal.rights.entity;
import com.productionhouse.crm.legal.contracts.entity.ContractRecord;import com.productionhouse.crm.mediahouse.media.entity.MediaAsset;import com.productionhouse.crm.task5.entity.Task5RecordBase;import jakarta.persistence.*;import lombok.*;
@Entity @Table(name="crm_media_rights",indexes={@Index(name="ix_crm_media_rights_media",columnList="media_asset_id"),@Index(name="ix_crm_media_rights_expiry",columnList="status,ends_at")}) @Getter @Setter @NoArgsConstructor
public class ContentRight extends Task5RecordBase{
@Column(name="type",length=80) private String rightsType;
@ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="media_asset_id") private MediaAsset mediaAsset;
@ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="contract_id") private ContractRecord contract;
@Column(length=120) private String territory;
@Column(length=500) private String platforms;
@Column(length=500) private String languages;
@Column(name="is_exclusive",nullable=false) private boolean exclusive;
@Column(name="starts_at") private java.time.LocalDate startsAt;
@Column(name="ends_at") private java.time.LocalDate endsAt;
@Column(length=2000) private String restrictions;
}
