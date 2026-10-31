package com.productionhouse.crm.audio.singer.entity;
import com.productionhouse.crm.task5.entity.Task5RecordBase;import jakarta.persistence.*;import lombok.*;
@Entity @Table(name="crm_media_singer",indexes={@Index(name="ix_crm_media_singer_status",columnList="status")}) @Getter @Setter @NoArgsConstructor
public class SingerProfile extends Task5RecordBase{
@Column(name="contact_email",length=254) private String email;
@Column(name="contact_phone",length=40) private String phone;
@Column(name="language",length=500) private String languages;
@Column(name="voice_type",length=80) private String voiceType;
@Column(name="voice_range",length=80) private String voiceRange;
}
