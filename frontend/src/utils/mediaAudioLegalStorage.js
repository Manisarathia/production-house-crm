// Storage and Data Service for Media, Audio & Legal Management
// Handles Post-Production & Media, Singer & Dubbing, and Contracts & Rights.

import { formatCurrency, normalizeLoopPlatform } from './productionStorage.js';

const POST_PROD_STORAGE_KEY = 'loopstream_crm_post_production';
const MEDIA_ASSETS_STORAGE_KEY = 'loopstream_crm_media_assets';
const SINGERS_STORAGE_KEY = 'loopstream_crm_singers';
const DUBBING_STORAGE_KEY = 'loopstream_crm_dubbing';
const CONTRACTS_STORAGE_KEY = 'loopstream_crm_contracts';
const RIGHTS_STORAGE_KEY = 'loopstream_crm_rights';

// ================= 1. POST-PRODUCTION DATA ================= //

export const INITIAL_POST_PRODUCTION = [
  {
    id: 'PST-101',
    project: 'The Last Monsoon',
    title: 'Dolby Vision Color Grading & DI Master',
    stage: 'Color Grading (DI)',
    supervisor: 'Red Chillies Color',
    leadArtist: 'Makarand Surte',
    facility: 'Red Chillies Color Lab, Mumbai',
    progress: 85,
    status: 'In Progress',
    targetDeliveryDate: '2026-11-08',
    reelsCount: '8 Episodes · 16 Reels',
    qcStatus: 'Passed Initial QC',
    platform: 'LoopNexus',
    tone: 'orange',
    notes: 'L*a*b gamut mapping locked for HDR10 and Dolby Vision 4.0 metadata passes.',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'PST-102',
    project: 'City of Echoes',
    title: 'Dolby Atmos 7.1.4 Surround Sound Mix & Foley',
    stage: 'Sound Design & Atmos Mix',
    supervisor: 'Sound Lab Mumbai',
    leadArtist: 'Sneha Khanwalkar',
    facility: 'Empire Studio, Floor 3, Mumbai',
    progress: 94,
    status: 'Pending Review',
    targetDeliveryDate: '2026-11-06',
    reelsCount: 'Feature Master · 6 Reels',
    qcStatus: 'Dolby Certification In-Review',
    platform: 'LoopNexus',
    tone: 'green',
    notes: 'Binaural headphone downmix and theatrical Atmos bed calibrated at 85 dBC.',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'PST-103',
    project: 'Beyond The Frame',
    title: 'Archival 35mm Celluloid Restoration & 4K DI',
    stage: 'Offline Edit',
    supervisor: 'Film Heritage Foundation',
    leadArtist: 'Anand Gandhi',
    facility: 'Prasad Film Labs, Chennai',
    progress: 70,
    status: 'In Progress',
    targetDeliveryDate: '2026-11-15',
    reelsCount: 'Feature Doc · 4 Reels',
    qcStatus: 'Archival Clean Pass Done',
    platform: 'LoopKids',
    tone: 'purple',
    notes: 'Grain reduction and scratch removal on 1940s nitrate camera negatives.',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'PST-104',
    project: 'Shadows of Varanasi',
    title: 'Underwater Temple CG Reconstruction VFX',
    stage: 'VFX Compositing',
    supervisor: 'FutureWorks Media',
    leadArtist: 'Gaurav Jain',
    facility: 'FutureWorks VFX Studio, Andheri',
    progress: 48,
    status: 'In Progress',
    targetDeliveryDate: '2026-12-20',
    reelsCount: '340 VFX Shots',
    qcStatus: 'Shot Review Pass 2',
    platform: 'LoopNexus',
    tone: 'blue',
    notes: 'Water simulation and ancient subterranean temple lighting passes in Unreal Engine 5.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'PST-105',
    project: 'Project Kaal: 2049',
    title: 'Cyberpunk Concept Pre-Vis & Offline Assembly',
    stage: 'Offline Edit',
    supervisor: 'Prime Focus Technologies',
    leadArtist: 'Nitin Baid',
    facility: 'Studio North Offline Suite 4',
    progress: 25,
    status: 'In Progress',
    targetDeliveryDate: '2027-02-15',
    reelsCount: 'Episodes 1-3 Assembly',
    qcStatus: 'Director Rough Assembly',
    platform: 'LoopNexus',
    tone: 'cyan',
    notes: 'Editing on Avid Media Composer with synced concept art visual plates.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'PST-106',
    project: 'Echoes of Mumbai Nights',
    title: 'Final QC, Subtitle Mastering & Delivery Package',
    stage: 'QC & Mastering',
    supervisor: 'Qube Cinema Digital',
    leadArtist: 'Konkona Sen Sharma',
    facility: 'Qube Central Lab, Mumbai',
    progress: 100,
    status: 'Approved',
    targetDeliveryDate: '2026-10-08',
    reelsCount: 'Anthology Master · 4 Reels',
    qcStatus: '100% Passed QC',
    platform: 'LoopKids',
    tone: 'green',
    notes: 'IMF and DCP package delivered with 5 language subtitle streams.',
    image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&h=450&q=85'
  }
];

// ================= 2. MEDIA ASSETS DATA ================= //

export const INITIAL_MEDIA_ASSETS = [
  {
    id: 'MED-201',
    title: 'TLM_S01E01_Master_ProRes4444XQ_v2.4.mov',
    project: 'The Last Monsoon',
    assetType: 'Master Cut',
    resolution: '4K UHD (3840x2160)',
    codecFormat: 'Apple ProRes 4444 XQ',
    fileSize: '312.4 GB',
    version: 'v2.4 (QC Approved)',
    storageLocation: 'Loop Vault - AWS S3 SGP (Hot)',
    checksum: 'sha256: d4a8f90b1c23847e',
    status: 'QC Passed',
    uploadedBy: 'Prime Focus Post',
    uploadDate: '2026-10-25',
    platform: 'LoopNexus',
    tone: 'orange',
    accessUrl: 'https://vault.loopstream.internal/masters/tlm-ep01-v2.4.mov',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'MED-202',
    title: 'COE_Feature_Atmos_PrintMaster_24bit48k.mxf',
    project: 'City of Echoes',
    assetType: 'Sound Stems / Atmos',
    resolution: 'Lossless Audio (48kHz/24-bit)',
    codecFormat: 'Dolby Atmos DCI MXF 128-Track',
    fileSize: '48.2 GB',
    version: 'v1.8 (Final Mix)',
    storageLocation: 'Loop Vault - Cloudflare R2',
    checksum: 'sha256: b710c22e41a967fa',
    status: 'Active Delivery',
    uploadedBy: 'Empire Studios Sound',
    uploadDate: '2026-10-28',
    platform: 'LoopNexus',
    tone: 'green',
    accessUrl: 'https://vault.loopstream.internal/audio/coe-atmos-v1.8.mxf',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'MED-203',
    title: 'BTF_Doc_4K_DCP_Interlop_Master_v1.0.tar',
    project: 'Beyond The Frame',
    assetType: 'DCP / Cinema Master',
    resolution: '4K DCI Flat (3996x2160)',
    codecFormat: 'JPEG2000 DCI Package (SMPTE)',
    fileSize: '184.6 GB',
    version: 'v1.0 (Festival Master)',
    storageLocation: 'Loop Archive - Glacier Mumbai',
    checksum: 'sha256: 3c92e10a88df4567',
    status: 'Archived',
    uploadedBy: 'Prasad Labs Chennai',
    uploadDate: '2026-10-20',
    platform: 'LoopKids',
    tone: 'purple',
    accessUrl: 'https://vault.loopstream.internal/dcp/btf-dcp-v1.0.tar',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'MED-204',
    title: 'SOV_VFX_UnderwaterTemple_EXR_Sequence_R04.zip',
    project: 'Shadows of Varanasi',
    assetType: 'VFX Plate',
    resolution: 'IMAX 1.90:1 (4096x2160)',
    codecFormat: 'OpenEXR Half-Float 16-bit',
    fileSize: '520.1 GB',
    version: 'v3.1 (Work In Progress)',
    storageLocation: 'On-Premises SAN High-Speed Tier',
    checksum: 'sha256: 9e01bc43a2ef9810',
    status: 'Under Review',
    uploadedBy: 'FutureWorks VFX',
    uploadDate: '2026-10-30',
    platform: 'LoopNexus',
    tone: 'blue',
    accessUrl: 'https://vault.loopstream.internal/vfx/sov-exr-r04-v3.1.zip',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'MED-205',
    title: 'EMN_Subtitles_MultiLanguage_8Tracks.imf',
    project: 'Echoes of Mumbai Nights',
    assetType: 'Subtitle / IMF Package',
    resolution: 'Timed Text XML (TTML / VTT)',
    codecFormat: 'SMPTE ST 2067-2 IMF TTML',
    fileSize: '1.2 GB',
    version: 'v2.0 (Verified)',
    storageLocation: 'Loop Edge Delivery CDN',
    checksum: 'sha256: 41bba69c2e0189ab',
    status: 'QC Passed',
    uploadedBy: 'Qube Localization',
    uploadDate: '2026-10-09',
    platform: 'LoopKids',
    tone: 'green',
    accessUrl: 'https://vault.loopstream.internal/subtitles/emn-imf-ttml.zip',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'MED-206',
    title: 'PKL_Teaser01_4K_ProRes422HQ_Stereo.mov',
    project: 'Project Kaal: 2049',
    assetType: 'Marketing Key Art & Promo',
    resolution: '4K UHD (3840x2160)',
    codecFormat: 'Apple ProRes 422 HQ',
    fileSize: '14.8 GB',
    version: 'v1.2 (Social Cut)',
    storageLocation: 'Loop Marketing Vault',
    checksum: 'sha256: ff182a934cde7812',
    status: 'Active Delivery',
    uploadedBy: 'Studio North Creative Hub',
    uploadDate: '2026-10-27',
    platform: 'LoopNexus',
    tone: 'cyan',
    accessUrl: 'https://vault.loopstream.internal/marketing/pkl-teaser01.mov',
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&h=450&q=85'
  }
];

// ================= 3. SINGER & SOUNDTRACK DATA ================= //

export const INITIAL_SINGERS = [
  {
    id: 'SNG-301',
    songTitle: 'Baarish Ke Saaye',
    project: 'The Last Monsoon',
    singerName: 'Arijit Singh',
    vocalType: 'Lead Vocalist (Male)',
    language: 'Hindi',
    musicDirector: 'Amit Trivedi',
    lyricist: 'Varun Grover',
    duration: '4 mins 28 secs',
    recordingStudio: 'YRF Studios (Studio A), Mumbai',
    recordingStatus: 'Mastered & Mixed',
    fee: 2500000,
    isrcCode: 'IN-L01-26-00412',
    releaseDate: '2026-11-10',
    platform: 'LoopNexus',
    tone: 'orange',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'SNG-302',
    songTitle: 'Raat Ka Shehar',
    project: 'City of Echoes',
    singerName: 'Rekha Bhardwaj',
    vocalType: 'Lead Vocalist (Female)',
    language: 'Hindi',
    musicDirector: 'Sneha Khanwalkar',
    lyricist: 'Swanand Kirkire',
    duration: '3 mins 55 secs',
    recordingStudio: 'Sound Lab Mumbai, Bandra',
    recordingStatus: 'Mastered & Mixed',
    fee: 1500000,
    isrcCode: 'IN-L01-26-00418',
    releaseDate: '2026-11-05',
    platform: 'LoopNexus',
    tone: 'green',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'SNG-303',
    songTitle: 'Tarangini (River Hymn)',
    project: 'Beyond The Frame',
    singerName: 'Shubha Mudgal',
    vocalType: 'Classical / Folk',
    language: 'Hindi & Sanskrit',
    musicDirector: 'Anand Gandhi & Ensemble',
    lyricist: 'Kabir & Traditional',
    duration: '6 mins 12 secs',
    recordingStudio: 'Prasad Sound Labs, Chennai',
    recordingStatus: 'Recorded',
    fee: 1200000,
    isrcCode: 'IN-L01-26-00424',
    releaseDate: '2026-11-20',
    platform: 'LoopKids',
    tone: 'purple',
    image: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'SNG-304',
    songTitle: 'Shiva Tandava Stotram (Re-imagined)',
    project: 'Shadows of Varanasi',
    singerName: 'Sid Sriram & Shankar Mahadevan',
    vocalType: 'Duet',
    language: 'Tamil & Hindi',
    musicDirector: 'A.R. Rahman',
    lyricist: 'Traditional / Mehboob',
    duration: '5 mins 40 secs',
    recordingStudio: 'Panchathan Record Inn, Chennai',
    recordingStatus: 'In Studio',
    fee: 3500000,
    isrcCode: 'IN-L01-26-00430',
    releaseDate: '2027-01-10',
    platform: 'LoopNexus',
    tone: 'orange',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'SNG-305',
    songTitle: 'Local Train Whisper',
    project: 'Echoes of Mumbai Nights',
    singerName: 'Prateek Kuhad',
    vocalType: 'Acoustic / Indie',
    language: 'Hindi & English',
    musicDirector: 'Prateek Kuhad',
    lyricist: 'Prateek Kuhad',
    duration: '3 mins 22 secs',
    recordingStudio: 'Island City Studios, Khar',
    recordingStatus: 'Mastered & Mixed',
    fee: 1800000,
    isrcCode: 'IN-L01-26-00436',
    releaseDate: '2026-10-01',
    platform: 'LoopKids',
    tone: 'green',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'SNG-306',
    songTitle: 'Neon Monsoon (Theme Beat)',
    project: 'Project Kaal: 2049',
    singerName: 'Divine & Jonita Gandhi',
    vocalType: 'Hip Hop / Electronic',
    language: 'Hindi & English',
    musicDirector: 'Nucleya',
    lyricist: 'Divine',
    duration: '3 mins 48 secs',
    recordingStudio: 'Gully Gang Studios, Mumbai',
    recordingStatus: 'Scheduled',
    fee: 2800000,
    isrcCode: 'IN-L01-26-00442',
    releaseDate: '2027-04-15',
    platform: 'LoopNexus',
    tone: 'cyan',
    image: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=800&h=450&q=85'
  }
];

// ================= 4. DUBBING SCHEDULES DATA ================= //

export const INITIAL_DUBBING = [
  {
    id: 'DUB-401',
    project: 'The Last Monsoon',
    characterName: 'SP Samarjit (Lead Inspector)',
    targetLanguage: 'Tamil',
    voiceArtist: 'P. Ravi Shankar',
    dubbingDirector: 'Mona Ghosh Shetty',
    studioFacility: 'Sound & Vision India (Floor 2), Andheri',
    sessionDate: '2026-11-04',
    sessionTime: '10:00 AM - 02:00 PM',
    reelsOrEpisodes: 'Episodes 1 to 4 · Reels 1-8',
    timecode: '00:00:00:00 - 02:45:30:00',
    status: 'In Progress',
    lipsyncQuality: '98% Accurate (A+ Grade)',
    platform: 'LoopNexus',
    tone: 'orange',
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'DUB-402',
    project: 'The Last Monsoon',
    characterName: 'Dr. Maya Lyngdoh',
    targetLanguage: 'Telugu',
    voiceArtist: 'Chinmayi Sripaada',
    dubbingDirector: 'K. Rajendra Prasad',
    studioFacility: 'Prasad Studios, Hyderabad',
    sessionDate: '2026-11-06',
    sessionTime: '02:30 PM - 07:00 PM',
    reelsOrEpisodes: 'Episodes 1 to 4 · Reels 1-8',
    timecode: '00:05:12:00 - 03:10:00:00',
    status: 'Scheduled',
    lipsyncQuality: 'Pending Session',
    platform: 'LoopNexus',
    tone: 'blue',
    image: 'https://images.unsplash.com/photo-1546707012-c46675f12716?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'DUB-403',
    project: 'City of Echoes',
    characterName: 'Kabir Anand (Retired Intelligence)',
    targetLanguage: 'English (International Dub)',
    voiceArtist: 'Atul Kumar',
    dubbingDirector: 'Lillete Dubey',
    studioFacility: 'Empire Audio Lab Studio 1, Mumbai',
    sessionDate: '2026-11-02',
    sessionTime: '11:00 AM - 04:00 PM',
    reelsOrEpisodes: 'Full Feature Film · 6 Reels',
    timecode: '00:00:00:00 - 02:14:00:00',
    status: 'Completed',
    lipsyncQuality: '100% Approved & Calibrated',
    platform: 'LoopNexus',
    tone: 'green',
    image: 'https://images.unsplash.com/photo-1525362081669-2b476bb628c3?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'DUB-404',
    project: 'Beyond The Frame',
    characterName: 'Narrator / Documentary Voiceover',
    targetLanguage: 'French (European Run)',
    voiceArtist: 'Jacques Perrin Studio',
    dubbingDirector: 'Claire Denis Lab',
    studioFacility: 'Dubbing Brothers Paris (Remote Source-Connect)',
    sessionDate: '2026-11-12',
    sessionTime: '03:00 PM - 08:00 PM IST',
    reelsOrEpisodes: 'Full Doc Cut · 98 Minutes',
    timecode: '00:00:00:00 - 01:38:00:00',
    status: 'Scheduled',
    lipsyncQuality: 'Voiceover Timing Locked',
    platform: 'LoopKids',
    tone: 'purple',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'DUB-405',
    project: 'Shadows of Varanasi',
    characterName: 'Gayatri Sen (Archaeologist)',
    targetLanguage: 'Malayalam',
    voiceArtist: 'Kavya Madhavan',
    dubbingDirector: 'B. Unnikrishnan',
    studioFacility: 'Chithranjali Studio, Trivandrum',
    sessionDate: '2026-12-05',
    sessionTime: '10:00 AM - 05:00 PM',
    reelsOrEpisodes: 'Reels 1 through 7',
    timecode: '00:00:00:00 - 02:32:00:00',
    status: 'Scheduled',
    lipsyncQuality: 'Script Localized',
    platform: 'LoopNexus',
    tone: 'orange',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'DUB-406',
    project: 'Echoes of Mumbai Nights',
    characterName: 'All Lead Cast (Anthology)',
    targetLanguage: 'Marathi (Native Subtitle & Dub)',
    voiceArtist: 'Sachin Khedekar & Amruta Subhash',
    dubbingDirector: 'Umesh Kulkarni',
    studioFacility: 'Sound Idea Studio, Dadar',
    sessionDate: '2026-09-25',
    sessionTime: '09:00 AM - 06:00 PM',
    reelsOrEpisodes: '4 Short Stories',
    timecode: '00:00:00:00 - 01:52:00:00',
    status: 'Completed',
    lipsyncQuality: '100% Approved & Mastered',
    platform: 'LoopKids',
    tone: 'green',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&h=450&q=85'
  }
];

// ================= 5. CONTRACTS DATA ================= //

export const INITIAL_CONTRACTS = [
  {
    id: 'CTR-501',
    title: 'Lead Actor Talent Agreement - Manoj Bajpayee',
    project: 'City of Echoes',
    counterparty: 'Exceed Entertainment Pvt Ltd',
    agreementType: 'Talent / Cast Agreement',
    contractValue: 22000000,
    paymentTerms: '30% Signing · 40% Wrap · 30% Delivery',
    effectiveDate: '2026-02-01',
    expiryDate: '2029-02-01',
    status: 'Executed / Signed',
    legalSignatory: 'Zoya Akhtar (Producer) & Manoj Bajpayee',
    governingLaw: 'High Court of Bombay, Mumbai',
    fileAttachment: 'CTR-501_Executed_MB_Talent.pdf',
    platform: 'LoopNexus',
    tone: 'green',
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'CTR-502',
    title: 'Series Showrunner & Directorial Services Agreement',
    project: 'The Last Monsoon',
    counterparty: 'Andolan Films LLP',
    agreementType: 'Director Service Contract',
    contractValue: 35000000,
    paymentTerms: 'Milestone-based (5 Tranches across Pre, Prod, Post)',
    effectiveDate: '2026-05-01',
    expiryDate: '2028-05-01',
    status: 'Executed / Signed',
    legalSignatory: 'Vikramaditya Motwane & Studio North Legal',
    governingLaw: 'High Court of Bombay, Mumbai',
    fileAttachment: 'CTR-502_Director_Agreement_Motwane.pdf',
    platform: 'LoopNexus',
    tone: 'orange',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'CTR-503',
    title: 'Music Synchronization & Original Score License',
    project: 'The Last Monsoon',
    counterparty: 'Sony Music Publishing India',
    agreementType: 'Music Synchronization License',
    contractValue: 12500000,
    paymentTerms: '100% Upon Master Delivery + 5% Digital Royalties',
    effectiveDate: '2026-06-15',
    expiryDate: '2036-06-14',
    status: 'Executed / Signed',
    legalSignatory: 'Amit Trivedi & Sony Music Legal Head',
    governingLaw: 'High Court of Delhi, New Delhi',
    fileAttachment: 'CTR-503_Music_Sync_License.pdf',
    platform: 'LoopNexus',
    tone: 'purple',
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'CTR-504',
    title: 'VFX Production Master Services & SLA Agreement',
    project: 'Shadows of Varanasi',
    counterparty: 'FutureWorks Media Works Limited',
    agreementType: 'Crew NDA & Work-for-Hire',
    contractValue: 48000000,
    paymentTerms: 'Monthly Invoicing against approved visual shot turnkey',
    effectiveDate: '2026-07-01',
    expiryDate: '2027-03-31',
    status: 'Under Legal Review',
    legalSignatory: 'Gaurav Jain (MD, FutureWorks) & Shobha Kapoor',
    governingLaw: 'High Court of Bombay, Mumbai',
    fileAttachment: 'CTR-504_FutureWorks_VFX_Draft_v3.pdf',
    platform: 'LoopNexus',
    tone: 'blue',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'CTR-505',
    title: 'Archival Film Footage Rights & Licensing Deed',
    project: 'Beyond The Frame',
    counterparty: 'National Film Development Corporation (NFDC)',
    agreementType: 'OTT Platform Distribution Agreement',
    contractValue: 7500000,
    paymentTerms: 'Lump Sum One-Time Royalty',
    effectiveDate: '2026-08-01',
    expiryDate: '2036-08-01',
    status: 'Executed / Signed',
    legalSignatory: 'Guneet Monga & Director NFDC Archives',
    governingLaw: 'High Court of Delhi, New Delhi',
    fileAttachment: 'CTR-505_NFDC_Archival_Rights_Deed.pdf',
    platform: 'LoopKids',
    tone: 'green',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'CTR-506',
    title: 'Sci-Fi Writers Room & Screenplay Option Agreement',
    project: 'Project Kaal: 2049',
    counterparty: 'Script Collective India LLP',
    agreementType: 'Talent / Cast Agreement',
    contractValue: 8500000,
    paymentTerms: '30% Bible · 30% Pilot Draft · 40% Full Episodes Lock',
    effectiveDate: '2026-09-01',
    expiryDate: '2027-12-31',
    status: 'In Negotiation',
    legalSignatory: 'Vasan Bala & Screenwriters Association Head',
    governingLaw: 'High Court of Bombay, Mumbai',
    fileAttachment: 'CTR-506_Writers_Room_Option_Draft.pdf',
    platform: 'LoopNexus',
    tone: 'cyan',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&h=450&q=85'
  }
];

// ================= 6. CONTENT RIGHTS DATA ================= //

export const INITIAL_RIGHTS = [
  {
    id: 'RGT-601',
    title: 'Exclusive Worldwide SVOD & Streaming Rights',
    project: 'The Last Monsoon',
    territory: 'Worldwide',
    rightsType: 'SVOD / OTT Subscription',
    exclusivity: 'Exclusive',
    rightsPeriod: '5 Years',
    startDate: '2026-11-18',
    endDate: '2031-11-17',
    platform: 'LoopNexus',
    licenseFee: 145000000,
    revenueSharePct: '0% (Flat License)',
    status: 'Active',
    restrictions: 'No Linear broadcast in India for 18 months from OTT release',
    tone: 'orange',
    image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'RGT-602',
    title: 'India & SAARC Direct-to-Digital Premiere Rights',
    project: 'City of Echoes',
    territory: 'India Subcontinent (SAARC)',
    rightsType: 'SVOD / OTT Subscription',
    exclusivity: 'Exclusive',
    rightsPeriod: '7 Years',
    startDate: '2026-11-12',
    endDate: '2033-11-11',
    platform: 'LoopNexus',
    licenseFee: 85000000,
    revenueSharePct: '10% TVOD Ad-supported backend',
    status: 'Active',
    restrictions: 'Theatrical holdback waived for direct digital release',
    tone: 'green',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'RGT-603',
    title: 'Global Educational & Family Documentary Rights',
    project: 'Beyond The Frame',
    territory: 'Worldwide (All Markets)',
    rightsType: 'SVOD / Educational & Institutional',
    exclusivity: 'Exclusive',
    rightsPeriod: 'Perpetuity (100 Years)',
    startDate: '2026-11-24',
    endDate: '2126-11-23',
    platform: 'LoopKids',
    licenseFee: 32000000,
    revenueSharePct: '20% Institutional Screening Pool',
    status: 'Active',
    restrictions: 'Open access for approved film archival festivals',
    tone: 'purple',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'RGT-604',
    title: 'Theatrical Exhibition & IMAX Release Rights',
    project: 'Shadows of Varanasi',
    territory: 'Worldwide Theatrical',
    rightsType: 'Theatrical Exhibition',
    exclusivity: 'Exclusive',
    rightsPeriod: '60-day Exclusive Window',
    startDate: '2027-01-26',
    endDate: '2027-03-27',
    platform: 'LoopNexus',
    licenseFee: 180000000,
    revenueSharePct: '52% Box Office Gross Share',
    status: 'Reserved',
    restrictions: 'Strict 8-week holdback before OTT streaming debut',
    tone: 'blue',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'RGT-605',
    title: 'Pan-India Multi-Lingual Linear Satellite Rights',
    project: 'Shadows of Varanasi',
    territory: 'India (Hindi, Tamil, Telugu)',
    rightsType: 'Linear Satellite Broadcast',
    exclusivity: 'Exclusive',
    rightsPeriod: '5 Years',
    startDate: '2027-04-01',
    endDate: '2032-03-31',
    platform: 'LoopNexus',
    licenseFee: 65000000,
    revenueSharePct: '0%',
    status: 'Licensed',
    restrictions: 'Broadcast permitted only after 90 days from theatrical release',
    tone: 'orange',
    image: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=800&h=450&q=85'
  },
  {
    id: 'RGT-606',
    title: 'In-Flight & Maritime Entertainment Rights',
    project: 'Echoes of Mumbai Nights',
    territory: 'Global Airlines & Cruise Lines',
    rightsType: 'In-Flight / Maritime',
    exclusivity: 'Non-Exclusive',
    rightsPeriod: '3 Years',
    startDate: '2026-10-15',
    endDate: '2029-10-14',
    platform: 'LoopKids',
    licenseFee: 8500000,
    revenueSharePct: 'Flat Fee per Carrier',
    status: 'Active',
    restrictions: 'Standard airline edited version certified',
    tone: 'green',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&h=450&q=85'
  }
];

// Helper to ensure item has verified image
const syncItemImage = (item, initialList, resolver) => {
  const match = initialList.find(i => i.id === item.id);
  if (match && match.image) {
    return {
      ...item,
      image: match.image
    };
  }
  return {
    ...item,
    image: item.image || resolver(item)
  };
};

// ================= CRUD HELPERS ================= //

// 1. Post-Production Storage
export function getStoredPostProduction() {
  try {
    const raw = localStorage.getItem(POST_PROD_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(POST_PROD_STORAGE_KEY, JSON.stringify(INITIAL_POST_PRODUCTION));
      return INITIAL_POST_PRODUCTION;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_POST_PRODUCTION;
    return list.map(item => syncItemImage(item, INITIAL_POST_PRODUCTION, getPostProductionImage));
  } catch (err) {
    console.error('Failed to load post-production tasks:', err);
    return INITIAL_POST_PRODUCTION;
  }
}

export function savePostProduction(list) {
  try {
    localStorage.setItem(POST_PROD_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save post-production tasks:', err);
  }
}

export function createPostProduction(data) {
  const current = getStoredPostProduction();
  const nextIdNum = current.reduce((max, item) => {
    const num = parseInt(item.id?.replace(/\D/g, '') || '0', 10);
    return num > max ? num : max;
  }, 100) + 1;

  const newItem = {
    id: `PST-${nextIdNum}`,
    project: data.project || 'Untitled Production',
    title: data.title || 'Untitled Post Task',
    stage: data.stage || 'Offline Edit',
    supervisor: data.supervisor || 'Unassigned Supervisor',
    leadArtist: data.leadArtist || 'Unassigned Artist',
    facility: data.facility || 'In-House Studio',
    progress: Number(data.progress || 0),
    status: data.status || 'In Progress',
    targetDeliveryDate: data.targetDeliveryDate || '',
    reelsCount: data.reelsCount || '1 Reel',
    qcStatus: data.qcStatus || 'Under Review',
    platform: normalizeLoopPlatform(data.platform),
    tone: data.status === 'Approved' ? 'green' : data.status === 'Pending Review' ? 'orange' : 'blue',
    notes: data.notes || '',
    image: data.image || getPostProductionImage({ stage: data.stage, title: data.title })
  };

  const updated = [newItem, ...current];
  savePostProduction(updated);
  return { item: newItem, all: updated };
}

export function updatePostProduction(id, updates) {
  const current = getStoredPostProduction();
  const updated = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        ...updates,
        progress: updates.progress !== undefined ? Number(updates.progress) : item.progress,
        platform: updates.platform ? normalizeLoopPlatform(updates.platform) : item.platform
      };
    }
    return item;
  });
  savePostProduction(updated);
  return updated;
}

export function deletePostProduction(id) {
  const current = getStoredPostProduction();
  const updated = current.filter(item => item.id !== id);
  savePostProduction(updated);
  return updated;
}

// 2. Media Assets Storage
export function getStoredMediaAssets() {
  try {
    const raw = localStorage.getItem(MEDIA_ASSETS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MEDIA_ASSETS_STORAGE_KEY, JSON.stringify(INITIAL_MEDIA_ASSETS));
      return INITIAL_MEDIA_ASSETS;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MEDIA_ASSETS;
    return list.map(item => syncItemImage(item, INITIAL_MEDIA_ASSETS, getMediaAssetImage));
  } catch (err) {
    console.error('Failed to load media assets:', err);
    return INITIAL_MEDIA_ASSETS;
  }
}

export function saveMediaAssets(list) {
  try {
    localStorage.setItem(MEDIA_ASSETS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save media assets:', err);
  }
}

export function createMediaAsset(data) {
  const current = getStoredMediaAssets();
  const nextIdNum = current.reduce((max, item) => {
    const num = parseInt(item.id?.replace(/\D/g, '') || '0', 10);
    return num > max ? num : max;
  }, 200) + 1;

  const newItem = {
    id: `MED-${nextIdNum}`,
    title: data.title || 'Untitled_Asset.mov',
    project: data.project || 'Untitled Production',
    assetType: data.assetType || 'Master Cut',
    resolution: data.resolution || '4K UHD (3840x2160)',
    codecFormat: data.codecFormat || 'Apple ProRes 422 HQ',
    fileSize: data.fileSize || '10.0 GB',
    version: data.version || 'v1.0',
    storageLocation: data.storageLocation || 'Loop Cloud Vault',
    checksum: data.checksum || `sha256: ${Math.random().toString(16).substring(2, 14)}`,
    status: data.status || 'QC Passed',
    uploadedBy: data.uploadedBy || 'Studio North Post',
    uploadDate: data.uploadDate || new Date().toISOString().split('T')[0],
    platform: normalizeLoopPlatform(data.platform),
    tone: data.status === 'QC Passed' ? 'green' : data.status === 'Under Review' ? 'orange' : 'blue',
    accessUrl: data.accessUrl || `https://vault.loopstream.internal/assets/MED-${nextIdNum}`,
    image: data.image || getMediaAssetImage({ assetType: data.assetType, title: data.title })
  };

  const updated = [newItem, ...current];
  saveMediaAssets(updated);
  return { item: newItem, all: updated };
}

export function updateMediaAsset(id, updates) {
  const current = getStoredMediaAssets();
  const updated = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        ...updates,
        platform: updates.platform ? normalizeLoopPlatform(updates.platform) : item.platform
      };
    }
    return item;
  });
  saveMediaAssets(updated);
  return updated;
}

export function deleteMediaAsset(id) {
  const current = getStoredMediaAssets();
  const updated = current.filter(item => item.id !== id);
  saveMediaAssets(updated);
  return updated;
}

// 3. Singers & Soundtracks Storage
export function getStoredSingers() {
  try {
    const raw = localStorage.getItem(SINGERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SINGERS_STORAGE_KEY, JSON.stringify(INITIAL_SINGERS));
      return INITIAL_SINGERS;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SINGERS;
    return list.map(item => syncItemImage(item, INITIAL_SINGERS, getSingerImage));
  } catch (err) {
    console.error('Failed to load singers data:', err);
    return INITIAL_SINGERS;
  }
}

export function saveSingers(list) {
  try {
    localStorage.setItem(SINGERS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save singers data:', err);
  }
}

export function createSinger(data) {
  const current = getStoredSingers();
  const nextIdNum = current.reduce((max, item) => {
    const num = parseInt(item.id?.replace(/\D/g, '') || '0', 10);
    return num > max ? num : max;
  }, 300) + 1;

  const newItem = {
    id: `SNG-${nextIdNum}`,
    songTitle: data.songTitle || 'Untitled Track',
    project: data.project || 'Untitled Production',
    singerName: data.singerName || 'Unassigned Vocalist',
    vocalType: data.vocalType || 'Lead Vocalist (Male)',
    language: data.language || 'Hindi',
    musicDirector: data.musicDirector || 'In-House Composer',
    lyricist: data.lyricist || 'Traditional',
    duration: data.duration || '3 mins 30 secs',
    recordingStudio: data.recordingStudio || 'Studio North Sound Floor',
    recordingStatus: data.recordingStatus || 'Recorded',
    fee: Number(data.fee || 0),
    isrcCode: data.isrcCode || `IN-L01-26-00${nextIdNum}`,
    releaseDate: data.releaseDate || '',
    platform: normalizeLoopPlatform(data.platform),
    tone: data.recordingStatus === 'Mastered & Mixed' ? 'green' : data.recordingStatus === 'In Studio' ? 'orange' : 'blue',
    image: data.image || getSingerImage({ singerName: data.singerName })
  };

  const updated = [newItem, ...current];
  saveSingers(updated);
  return { item: newItem, all: updated };
}

export function updateSinger(id, updates) {
  const current = getStoredSingers();
  const updated = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        ...updates,
        fee: updates.fee !== undefined ? Number(updates.fee) : item.fee,
        platform: updates.platform ? normalizeLoopPlatform(updates.platform) : item.platform
      };
    }
    return item;
  });
  saveSingers(updated);
  return updated;
}

export function deleteSinger(id) {
  const current = getStoredSingers();
  const updated = current.filter(item => item.id !== id);
  saveSingers(updated);
  return updated;
}

// 4. Dubbing Schedules Storage
export function getStoredDubbing() {
  try {
    const raw = localStorage.getItem(DUBBING_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DUBBING_STORAGE_KEY, JSON.stringify(INITIAL_DUBBING));
      return INITIAL_DUBBING;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DUBBING;
    return list.map(item => syncItemImage(item, INITIAL_DUBBING, getDubbingImage));
  } catch (err) {
    console.error('Failed to load dubbing schedules:', err);
    return INITIAL_DUBBING;
  }
}

export function saveDubbing(list) {
  try {
    localStorage.setItem(DUBBING_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save dubbing schedules:', err);
  }
}

export function createDubbing(data) {
  const current = getStoredDubbing();
  const nextIdNum = current.reduce((max, item) => {
    const num = parseInt(item.id?.replace(/\D/g, '') || '0', 10);
    return num > max ? num : max;
  }, 400) + 1;

  const newItem = {
    id: `DUB-${nextIdNum}`,
    project: data.project || 'Untitled Production',
    characterName: data.characterName || 'Character Name',
    targetLanguage: data.targetLanguage || 'Hindi',
    voiceArtist: data.voiceArtist || 'Unassigned Voice Artist',
    dubbingDirector: data.dubbingDirector || 'Dubbing Supervisor',
    studioFacility: data.studioFacility || 'Local Dubbing Lab',
    sessionDate: data.sessionDate || new Date().toISOString().split('T')[0],
    sessionTime: data.sessionTime || '10:00 AM - 02:00 PM',
    reelsOrEpisodes: data.reelsOrEpisodes || 'Reels 1-2',
    timecode: data.timecode || '00:00:00:00 - 01:00:00:00',
    status: data.status || 'Scheduled',
    lipsyncQuality: data.lipsyncQuality || 'Pending Session',
    platform: normalizeLoopPlatform(data.platform),
    tone: data.status === 'Completed' ? 'green' : data.status === 'In Progress' ? 'orange' : 'blue',
    image: data.image || getDubbingImage({ voiceArtist: data.voiceArtist })
  };

  const updated = [newItem, ...current];
  saveDubbing(updated);
  return { item: newItem, all: updated };
}

export function updateDubbing(id, updates) {
  const current = getStoredDubbing();
  const updated = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        ...updates,
        platform: updates.platform ? normalizeLoopPlatform(updates.platform) : item.platform
      };
    }
    return item;
  });
  saveDubbing(updated);
  return updated;
}

export function deleteDubbing(id) {
  const current = getStoredDubbing();
  const updated = current.filter(item => item.id !== id);
  saveDubbing(updated);
  return updated;
}

// 5. Contracts Storage
export function getStoredContracts() {
  try {
    const raw = localStorage.getItem(CONTRACTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(INITIAL_CONTRACTS));
      return INITIAL_CONTRACTS;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CONTRACTS;
    return list.map(item => syncItemImage(item, INITIAL_CONTRACTS, getContractImage));
  } catch (err) {
    console.error('Failed to load contracts data:', err);
    return INITIAL_CONTRACTS;
  }
}

export function saveContracts(list) {
  try {
    localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save contracts data:', err);
  }
}

export function createContract(data) {
  const current = getStoredContracts();
  const nextIdNum = current.reduce((max, item) => {
    const num = parseInt(item.id?.replace(/\D/g, '') || '0', 10);
    return num > max ? num : max;
  }, 500) + 1;

  const newItem = {
    id: `CTR-${nextIdNum}`,
    title: data.title || 'Untitled Agreement',
    project: data.project || 'Untitled Production',
    counterparty: data.counterparty || 'Counterparty Name',
    agreementType: data.agreementType || 'Talent / Cast Agreement',
    contractValue: Number(data.contractValue || 0),
    paymentTerms: data.paymentTerms || 'Standard Milestones',
    effectiveDate: data.effectiveDate || new Date().toISOString().split('T')[0],
    expiryDate: data.expiryDate || '',
    status: data.status || 'Executed / Signed',
    legalSignatory: data.legalSignatory || 'Producer & Talent',
    governingLaw: data.governingLaw || 'High Court of Bombay, Mumbai',
    fileAttachment: data.fileAttachment || `CTR-${nextIdNum}_Agreement.pdf`,
    platform: normalizeLoopPlatform(data.platform),
    tone: data.status === 'Executed / Signed' ? 'green' : data.status === 'In Negotiation' ? 'orange' : 'purple',
    image: data.image || getContractImage({ agreementType: data.agreementType, title: data.title })
  };

  const updated = [newItem, ...current];
  saveContracts(updated);
  return { item: newItem, all: updated };
}

export function updateContract(id, updates) {
  const current = getStoredContracts();
  const updated = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        ...updates,
        contractValue: updates.contractValue !== undefined ? Number(updates.contractValue) : item.contractValue,
        platform: updates.platform ? normalizeLoopPlatform(updates.platform) : item.platform
      };
    }
    return item;
  });
  saveContracts(updated);
  return updated;
}

export function deleteContract(id) {
  const current = getStoredContracts();
  const updated = current.filter(item => item.id !== id);
  saveContracts(updated);
  return updated;
}

// 6. Content Rights Storage
export function getStoredRights() {
  try {
    const raw = localStorage.getItem(RIGHTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RIGHTS_STORAGE_KEY, JSON.stringify(INITIAL_RIGHTS));
      return INITIAL_RIGHTS;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_RIGHTS;
    return list.map(item => syncItemImage(item, INITIAL_RIGHTS, getContentRightImage));
  } catch (err) {
    console.error('Failed to load content rights data:', err);
    return INITIAL_RIGHTS;
  }
}

export function saveRights(list) {
  try {
    localStorage.setItem(RIGHTS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save content rights data:', err);
  }
}

export function createRight(data) {
  const current = getStoredRights();
  const nextIdNum = current.reduce((max, item) => {
    const num = parseInt(item.id?.replace(/\D/g, '') || '0', 10);
    return num > max ? num : max;
  }, 600) + 1;

  const newItem = {
    id: `RGT-${nextIdNum}`,
    title: data.title || 'Untitled Content Right',
    project: data.project || 'Untitled Production',
    territory: data.territory || 'Worldwide',
    rightsType: data.rightsType || 'SVOD / OTT Subscription',
    exclusivity: data.exclusivity || 'Exclusive',
    rightsPeriod: data.rightsPeriod || '5 Years',
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    endDate: data.endDate || '',
    platform: normalizeLoopPlatform(data.platform),
    licenseFee: Number(data.licenseFee || 0),
    revenueSharePct: data.revenueSharePct || '0%',
    status: data.status || 'Active',
    restrictions: data.restrictions || 'Standard Holdback Apply',
    tone: data.status === 'Active' ? 'green' : data.status === 'Reserved' ? 'orange' : 'blue',
    image: data.image || getContentRightImage({ rightsType: data.rightsType, title: data.title })
  };

  const updated = [newItem, ...current];
  saveRights(updated);
  return { item: newItem, all: updated };
}

export function updateRight(id, updates) {
  const current = getStoredRights();
  const updated = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        ...updates,
        licenseFee: updates.licenseFee !== undefined ? Number(updates.licenseFee) : item.licenseFee,
        platform: updates.platform ? normalizeLoopPlatform(updates.platform) : item.platform
      };
    }
    return item;
  });
  saveRights(updated);
  return updated;
}

export function deleteRight(id) {
  const current = getStoredRights();
  const updated = current.filter(item => item.id !== id);
  saveRights(updated);
  return updated;
}

// ================= VISUAL ASSET DICTIONARIES & RESOLVERS (100% 16:9 Landscape Verified) ================= //

export const POST_PRODUCTION_IMAGES = {
  'Color Grading (DI)': 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&h=450&q=85',
  'Sound Design & Atmos Mix': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&h=450&q=85',
  'Offline Edit': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&h=450&q=85',
  'VFX Compositing': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&h=450&q=85',
  'QC & Mastering': 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&h=450&q=85',
  DEFAULT: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&h=450&q=85'
};

export const getPostProductionImage = (task) => {
  if (task?.image && task.image.trim() && !task.image.includes('photo-1536240478700')) return task.image;
  if (!task) return POST_PRODUCTION_IMAGES.DEFAULT;
  const stage = task.stage || '';
  if (POST_PRODUCTION_IMAGES[stage]) return POST_PRODUCTION_IMAGES[stage];
  const title = (task.title || '').toLowerCase();
  if (title.includes('color') || title.includes('di')) return POST_PRODUCTION_IMAGES['Color Grading (DI)'];
  if (title.includes('atmos') || title.includes('sound') || title.includes('mix')) return POST_PRODUCTION_IMAGES['Sound Design & Atmos Mix'];
  if (title.includes('vfx') || title.includes('cg')) return POST_PRODUCTION_IMAGES['VFX Compositing'];
  if (title.includes('edit') || title.includes('assembly')) return POST_PRODUCTION_IMAGES['Offline Edit'];
  if (title.includes('qc') || title.includes('master')) return POST_PRODUCTION_IMAGES['QC & Mastering'];
  return POST_PRODUCTION_IMAGES.DEFAULT;
};

export const MEDIA_ASSET_IMAGES = {
  'Master Cut': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&h=450&q=85',
  'Sound Stems / Atmos': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&h=450&q=85',
  'DCP / Cinema Master': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&h=450&q=85',
  'VFX Plate': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&h=450&q=85',
  'Subtitle / IMF Package': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&h=450&q=85',
  'Marketing Key Art & Promo': 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&h=450&q=85',
  DEFAULT: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&h=450&q=85'
};

export const getMediaAssetImage = (asset) => {
  if (asset?.image && asset.image.trim() && !asset.image.includes('photo-1518173946687')) return asset.image;
  if (!asset) return MEDIA_ASSET_IMAGES.DEFAULT;
  const type = asset.assetType || '';
  if (MEDIA_ASSET_IMAGES[type]) return MEDIA_ASSET_IMAGES[type];
  const title = (asset.title || '').toLowerCase();
  if (title.includes('atmos') || title.includes('audio') || title.includes('stem')) return MEDIA_ASSET_IMAGES['Sound Stems / Atmos'];
  if (title.includes('dcp') || title.includes('cinema')) return MEDIA_ASSET_IMAGES['DCP / Cinema Master'];
  if (title.includes('vfx') || title.includes('exr')) return MEDIA_ASSET_IMAGES['VFX Plate'];
  if (title.includes('subtitle') || title.includes('imf')) return MEDIA_ASSET_IMAGES['Subtitle / IMF Package'];
  if (title.includes('promo') || title.includes('teaser')) return MEDIA_ASSET_IMAGES['Marketing Key Art & Promo'];
  return MEDIA_ASSET_IMAGES['Master Cut'];
};

export const SINGER_IMAGES = {
  'Arijit Singh': 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&h=450&q=85',
  'Rekha Bhardwaj': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&h=450&q=85',
  'Shubha Mudgal': 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=800&h=450&q=85',
  'Sid Sriram & Shankar Mahadevan': 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&h=450&q=85',
  'Prateek Kuhad': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&h=450&q=85',
  'Divine & Jonita Gandhi': 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=800&h=450&q=85',
  DEFAULT: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&h=450&q=85'
};

export const getSingerImage = (singer) => {
  if (singer?.image && singer.image.trim() && !singer.image.includes('photo-1520523839898')) return singer.image;
  if (!singer) return SINGER_IMAGES.DEFAULT;
  const name = singer.singerName || '';
  if (SINGER_IMAGES[name]) return SINGER_IMAGES[name];
  const n = name.toLowerCase();
  if (n.includes('arijit')) return SINGER_IMAGES['Arijit Singh'];
  if (n.includes('rekha')) return SINGER_IMAGES['Rekha Bhardwaj'];
  if (n.includes('shubha')) return SINGER_IMAGES['Shubha Mudgal'];
  if (n.includes('sid') || n.includes('shankar')) return SINGER_IMAGES['Sid Sriram & Shankar Mahadevan'];
  if (n.includes('prateek')) return SINGER_IMAGES['Prateek Kuhad'];
  if (n.includes('divine') || n.includes('jonita')) return SINGER_IMAGES['Divine & Jonita Gandhi'];
  return SINGER_IMAGES.DEFAULT;
};

export const DUBBING_IMAGES = {
  'P. Ravi Shankar': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&h=450&q=85',
  'Chinmayi Sripaada': 'https://images.unsplash.com/photo-1546707012-c46675f12716?auto=format&fit=crop&w=800&h=450&q=85',
  'Atul Kumar': 'https://images.unsplash.com/photo-1525362081669-2b476bb628c3?auto=format&fit=crop&w=800&h=450&q=85',
  'Jacques Perrin Studio': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&h=450&q=85',
  'Kavya Madhavan': 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&h=450&q=85',
  'Sachin Khedekar & Amruta Subhash': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&h=450&q=85',
  DEFAULT: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&h=450&q=85'
};

export const getDubbingImage = (dubbing) => {
  if (dubbing?.image && dubbing.image.trim()) return dubbing.image;
  if (!dubbing) return DUBBING_IMAGES.DEFAULT;
  const artist = dubbing.voiceArtist || '';
  if (DUBBING_IMAGES[artist]) return DUBBING_IMAGES[artist];
  const a = artist.toLowerCase();
  if (a.includes('ravi')) return DUBBING_IMAGES['P. Ravi Shankar'];
  if (a.includes('chinmayi')) return DUBBING_IMAGES['Chinmayi Sripaada'];
  if (a.includes('atul')) return DUBBING_IMAGES['Atul Kumar'];
  if (a.includes('jacques') || a.includes('perrin')) return DUBBING_IMAGES['Jacques Perrin Studio'];
  if (a.includes('kavya')) return DUBBING_IMAGES['Kavya Madhavan'];
  if (a.includes('sachin') || a.includes('amruta')) return DUBBING_IMAGES['Sachin Khedekar & Amruta Subhash'];
  return DUBBING_IMAGES.DEFAULT;
};

export const CONTRACT_IMAGES = {
  'Talent / Cast Agreement': 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&h=450&q=85',
  'Director Service Contract': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&h=450&q=85',
  'Music Synchronization License': 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=800&h=450&q=85',
  'Crew NDA & Work-for-Hire': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&h=450&q=85',
  'OTT Platform Distribution Agreement': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&h=450&q=85',
  DEFAULT: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&h=450&q=85'
};

export const getContractImage = (contract) => {
  if (contract?.image && contract.image.trim() && !contract.image.includes('photo-1507842229451')) return contract.image;
  if (!contract) return CONTRACT_IMAGES.DEFAULT;
  const type = contract.agreementType || '';
  if (CONTRACT_IMAGES[type]) return CONTRACT_IMAGES[type];
  const t = (contract.title || '').toLowerCase();
  if (t.includes('talent') || t.includes('actor')) return CONTRACT_IMAGES['Talent / Cast Agreement'];
  if (t.includes('director') || t.includes('showrunner')) return CONTRACT_IMAGES['Director Service Contract'];
  if (t.includes('music') || t.includes('sync')) return CONTRACT_IMAGES['Music Synchronization License'];
  if (t.includes('vfx') || t.includes('nda')) return CONTRACT_IMAGES['Crew NDA & Work-for-Hire'];
  if (t.includes('distribution') || t.includes('rights')) return CONTRACT_IMAGES['OTT Platform Distribution Agreement'];
  return CONTRACT_IMAGES.DEFAULT;
};

export const RIGHTS_IMAGES = {
  'SVOD / OTT Subscription': 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&h=450&q=85',
  'Theatrical Exhibition': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&h=450&q=85',
  'Linear Satellite Broadcast': 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=800&h=450&q=85',
  'In-Flight / Maritime': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&h=450&q=85',
  'SVOD / Educational & Institutional': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&h=450&q=85',
  DEFAULT: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&h=450&q=85'
};

export const getContentRightImage = (right) => {
  if (right?.image && right.image.trim()) return right.image;
  if (!right) return RIGHTS_IMAGES.DEFAULT;
  const type = right.rightsType || '';
  if (RIGHTS_IMAGES[type]) return RIGHTS_IMAGES[type];
  const t = (right.title || '').toLowerCase();
  if (t.includes('theatrical') || t.includes('imax')) return RIGHTS_IMAGES['Theatrical Exhibition'];
  if (t.includes('satellite') || t.includes('linear')) return RIGHTS_IMAGES['Linear Satellite Broadcast'];
  if (t.includes('flight') || t.includes('airline')) return RIGHTS_IMAGES['In-Flight / Maritime'];
  if (t.includes('educational') || t.includes('documentary')) return RIGHTS_IMAGES['SVOD / Educational & Institutional'];
  return RIGHTS_IMAGES['SVOD / OTT Subscription'];
};
