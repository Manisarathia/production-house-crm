package com.productionhouse.crm.audio.dubbing.entity;
import com.productionhouse.crm.audio.singer.entity.SingerProfile;import com.productionhouse.crm.mediahouse.media.entity.MediaAsset;import com.productionhouse.crm.task5.entity.Task5RecordBase;import jakarta.persistence.*;import lombok.*;
@Entity @Table(name="crm_media_dubbing",indexes={@Index(name="ix_crm_media_dub_project",columnList="project_ref"),@Index(name="ix_crm_media_dub_schedule",columnList="scheduled_at")}) @Getter @Setter @NoArgsConstructor
public class DubbingSession extends Task5RecordBase{
@ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="singer_id") private SingerProfile singer;
@ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="media_asset_id") private MediaAsset mediaAsset;
@Column(name="scheduled_at") private java.time.LocalDateTime scheduledAt;
@Column(name="ends_at") private java.time.LocalDateTime endsAt;
@Column(length=120) private String studio;
@Column(length=100) private String language;
}
