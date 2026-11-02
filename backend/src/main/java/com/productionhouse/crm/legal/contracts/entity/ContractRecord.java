package com.productionhouse.crm.legal.contracts.entity;
import com.productionhouse.crm.mediahouse.media.entity.MediaAsset;import com.productionhouse.crm.task5.entity.Task5RecordBase;import jakarta.persistence.*;import lombok.*;
@Entity @Table(name="crm_media_contracts",indexes={@Index(name="ix_crm_media_contract_status",columnList="status"),@Index(name="ix_crm_media_contract_end",columnList="ends_at")}) @Getter @Setter @NoArgsConstructor
public class ContractRecord extends Task5RecordBase{
@Column(name="type",length=80) private String contractType;
@Column(name="party_one",nullable=false,length=200) private String partyOne;
@Column(name="party_two",length=200) private String partyTwo;
@ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="media_asset_id") private MediaAsset mediaAsset;
@Column(name="starts_at") private java.time.LocalDate startsAt;
@Column(name="ends_at") private java.time.LocalDate endsAt;
@Column(name="renewal_at") private java.time.LocalDate renewalAt;
@Column(name="document_reference",length=500) private String documentReference;
}
