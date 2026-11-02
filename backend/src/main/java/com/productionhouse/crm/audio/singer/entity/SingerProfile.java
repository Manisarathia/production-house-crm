package com.productionhouse.crm.audio.singer.entity;
import com.productionhouse.crm.task5.entity.Task5RecordBase;import jakarta.persistence.*;import lombok.*;
@Entity @Table(name="crm_media_singer",indexes={@Index(name="ix_crm_media_singer_status",columnList="status")}) @Getter @Setter @NoArgsConstructor
public class SingerProfile extends Task5RecordBase{
@Column(name="contact_email",length=254) private String email;
@Column(name="contact_phone",length=40) private String phone;
@Column(name="language",length=500) private String languages;
@Column(name="voice_type",length=80) private String voiceType;
@Column(name="voice_range",length=80) private String voiceRange;
@Column(name="music_director",length=200) private String musicDirector;
@Column(length=200) private String lyricist;
@Column(name="track_duration",length=80) private String duration;
@Column(name="recording_studio",length=200) private String recordingStudio;
@Column(name="artist_fee",precision=19,scale=2) private java.math.BigDecimal fee;
@Column(name="isrc_code",length=40) private String isrcCode;
@Column(name="release_date") private java.time.LocalDate releaseDate;
}
