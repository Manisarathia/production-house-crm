package com.productionhouse.crm.mediahouse.postproduction.entity;
import com.productionhouse.crm.mediahouse.media.entity.MediaAsset;import com.productionhouse.crm.task5.entity.Task5RecordBase;import jakarta.persistence.*;import lombok.*;
import com.productionhouse.crm.auth.entity.CrmUser;
@Entity @Table(name="crm_media_postproduction",indexes={@Index(name="ix_crm_media_postproject",columnList="project_ref"),@Index(name="ix_crm_media_poststatus_due",columnList="status,due_at")}) @Getter @Setter @NoArgsConstructor
public class PostProductionTask extends Task5RecordBase{
@ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="media_asset_id") private MediaAsset mediaAsset;
@ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="assigned_user_id") private CrmUser assignedTo;
@Column(length=40) private String priority;
@Column(name="due_at") private java.time.LocalDate dueAt;
@Column(name="started_at") private java.time.LocalDate startedAt;
@Column(name="completed_at") private java.time.LocalDate completedAt;
}
