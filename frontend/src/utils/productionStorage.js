// Production House CRM - Storage & Data Service for Projects, Titles, Cast & Crew, Episodes & Scenes
// Persists all production data in localStorage with full CRUD capabilities.

const PROJECTS_STORAGE_KEY = 'loopstream_crm_projects';
const TITLES_STORAGE_KEY = 'loopstream_crm_titles';
const CAST_CREW_STORAGE_KEY = 'loopstream_crm_cast_crew';
const EPISODES_STORAGE_KEY = 'loopstream_crm_episodes';
const SCENES_STORAGE_KEY = 'loopstream_crm_scenes';

export const INITIAL_PROJECTS = [
  {
    id: 'PRJ-101',
    name: 'The Last Monsoon',
    code: 'TLM-2026',
    type: 'Web Series',
    genre: 'Drama / Thriller',
    status: 'In Production',
    stage: 'Principal Photography',
    progress: 72,
    budget: 185000000, // ₹18.5 Cr
    spent: 133200000,  // ₹13.32 Cr
    startDate: '2026-06-15',
    targetDeliveryDate: '2026-11-18',
    director: 'Vikramaditya Motwane',
    producer: 'Zoya Akhtar',
    location: 'Cherrapunji & Mumbai, India',
    platform: 'LoopNexus',
    tone: 'blue',
    synopsis: 'A gripping investigative crime drama unraveling across 48 continuous hours of torrential rain in Meghalaya as a long-buried secret surfaces.'
  },
  {
    id: 'PRJ-102',
    name: 'City of Echoes',
    code: 'COE-2026',
    type: 'Feature Film',
    genre: 'Neo-Noir Crime',
    status: 'Post-production',
    stage: 'Sound Mix & VFX',
    progress: 91,
    budget: 120000000, // ₹12.0 Cr
    spent: 109200000,  // ₹10.92 Cr
    startDate: '2026-03-01',
    targetDeliveryDate: '2026-11-12',
    director: 'Anurag Kashyap',
    producer: 'Vikram Malhotra',
    location: 'Old Delhi & Kolkata',
    platform: 'LoopNexus',
    tone: 'green',
    synopsis: 'A retired intelligence officer gets drawn into a labyrinth of wiretaps and high-stakes political intrigue inside the capital.'
  },
  {
    id: 'PRJ-103',
    name: 'Beyond The Frame',
    code: 'BTF-2026',
    type: 'Documentary',
    genre: 'Art & Cinema',
    status: 'Pre-production',
    stage: 'Location Scouting & Casting',
    progress: 38,
    budget: 42000000, // ₹4.2 Cr
    spent: 16000000,  // ₹1.6 Cr
    startDate: '2026-08-10',
    targetDeliveryDate: '2026-11-24',
    director: 'Anand Gandhi',
    producer: 'Guneet Monga',
    location: 'Varanasi, Leh & Prague',
    platform: 'LoopKids',
    tone: 'purple',
    synopsis: 'An intimate, cinematic chronicle exploring forgotten celluloid masters and indigenous storytelling traditions across three continents.'
  },
  {
    id: 'PRJ-104',
    name: 'Shadows of Varanasi',
    code: 'SOV-2027',
    type: 'Feature Film',
    genre: 'Mythological Thriller',
    status: 'In Production',
    stage: 'Action Sequencing & Unit 2',
    progress: 55,
    budget: 280000000, // ₹28.0 Cr
    spent: 154000000,  // ₹15.4 Cr
    startDate: '2026-05-20',
    targetDeliveryDate: '2027-01-26',
    director: 'Neeraj Pandey',
    producer: 'Shobha Kapoor',
    location: 'Varanasi Ghats & Ramnagar Fort',
    platform: 'LoopNexus',
    tone: 'orange',
    synopsis: 'When ancient sacred artifacts vanish overnight from sealed river vaults, an archaeologist and a detective race against an astronomical deadline.'
  },
  {
    id: 'PRJ-105',
    name: 'Project Kaal: 2049',
    code: 'PKL-2027',
    type: 'Web Series',
    genre: 'Sci-Fi Dystopian',
    status: 'Development',
    stage: 'Writers Room & Concept Art',
    progress: 18,
    budget: 350000000, // ₹35.0 Cr
    spent: 52000000,   // ₹5.2 Cr
    startDate: '2026-09-01',
    targetDeliveryDate: '2027-05-15',
    director: 'Vasan Bala',
    producer: 'Siddharth Roy Kapur',
    location: 'Hyderabad Studio Sets & Ladakh',
    platform: 'LoopNexus',
    tone: 'cyan',
    synopsis: 'In a near-future Mumbai where monsoons have dried up completely, an underground water cartel controls society until a hacker discovers synthetic rain formula.'
  },
  {
    id: 'PRJ-106',
    name: 'Echoes of Mumbai Nights',
    code: 'EMN-2026',
    type: 'Short Film',
    genre: 'Romance / Drama',
    status: 'Completed',
    stage: 'Delivered & Master Archived',
    progress: 100,
    budget: 18000000, // ₹1.8 Cr
    spent: 17500000,  // ₹1.75 Cr
    startDate: '2026-01-15',
    targetDeliveryDate: '2026-10-10',
    director: 'Konkona Sen Sharma',
    producer: 'Ronnie Screwvala',
    location: 'South Mumbai & Marine Drive',
    platform: 'LoopKids',
    tone: 'green',
    synopsis: 'Four strangers encounter one another on a fateful local train journey during late night in Mumbai, changing their paths forever.'
  }
];

export const INITIAL_TITLES = [
  {
    id: 'TIT-201',
    title: 'The Last Monsoon',
    category: 'Web Series',
    seasons: 'Season 1',
    episodes: 8,
    runtime: '8 Episodes · ~48m each',
    releaseType: 'Loop Exclusive',
    platform: 'LoopNexus',
    genre: 'Drama / Thriller',
    censorRating: 'U/A 16+',
    contentStatus: 'VFX & Grading',
    associatedProject: 'The Last Monsoon',
    masterFormat: '4K Dolby Vision · Atmos',
    audioLanguages: 'Hindi (Original), Tamil, Telugu, English Dub',
    subtitles: 'English, Hindi, Spanish, French (18 Languages)',
    targetReleaseDate: '2026-11-18',
    director: 'Vikramaditya Motwane',
    tone: 'blue',
    logline: '8-episode thriller series chronicling a high-stakes missing persons chase through Meghalayan floods.'
  },
  {
    id: 'TIT-202',
    title: 'City of Echoes',
    category: 'Movie',
    seasons: 'Feature Film',
    episodes: 1,
    runtime: '134 minutes',
    releaseType: 'Direct-to-Digital',
    platform: 'LoopNexus',
    genre: 'Neo-Noir Crime',
    censorRating: 'A (Adult 18+)',
    contentStatus: 'Ready for Delivery',
    associatedProject: 'City of Echoes',
    masterFormat: '4K UHD · 5.1 Surround',
    audioLanguages: 'Hindi (Original), English',
    subtitles: 'English, Hindi',
    targetReleaseDate: '2026-11-12',
    director: 'Anurag Kashyap',
    tone: 'green',
    logline: 'An espionage thriller navigating the murky politics, wiretaps, and underworld contacts in New Delhi.'
  },
  {
    id: 'TIT-203',
    title: 'Beyond The Frame',
    category: 'Documentary',
    seasons: 'Feature Doc',
    episodes: 1,
    runtime: '98 minutes',
    releaseType: 'Festival Run & Loop Stream',
    platform: 'LoopKids',
    genre: 'Art & Cinema',
    censorRating: 'U (Universal)',
    contentStatus: 'Filming',
    associatedProject: 'Beyond The Frame',
    masterFormat: '4K HDR10 · Stereo 2.0',
    audioLanguages: 'English & Hindi (Bilingual)',
    subtitles: 'English, French, German, Japanese',
    targetReleaseDate: '2026-11-24',
    director: 'Anand Gandhi',
    tone: 'purple',
    logline: 'Documentary tracing cinematic heritage, restored film stock, and visionary silent era auteurs.'
  },
  {
    id: 'TIT-204',
    title: 'Shadows of Varanasi',
    category: 'Movie',
    seasons: 'Feature Film',
    episodes: 1,
    runtime: '152 minutes',
    releaseType: 'Theatrical + Loop Stream',
    platform: 'LoopNexus',
    genre: 'Mythological Thriller',
    censorRating: 'U/A 16+',
    contentStatus: 'Filming',
    associatedProject: 'Shadows of Varanasi',
    masterFormat: 'IMAX 2.39:1 · Dolby Atmos',
    audioLanguages: 'Hindi, Tamil, Telugu, Kannada, Malayalam',
    subtitles: 'English, Arabic, Russian',
    targetReleaseDate: '2027-01-26',
    director: 'Neeraj Pandey',
    tone: 'orange',
    logline: 'A mega-scale detective adventure involving centuries-old river mysteries along the Ganges.'
  },
  {
    id: 'TIT-205',
    title: 'Project Kaal: 2049 (Season 1)',
    category: 'Web Series',
    seasons: 'Season 1',
    episodes: 6,
    runtime: '6 Episodes · ~55m each',
    releaseType: 'Loop Global Premiere',
    platform: 'LoopNexus',
    genre: 'Sci-Fi Dystopian',
    censorRating: 'U/A 16+',
    contentStatus: 'In Scripting',
    associatedProject: 'Project Kaal: 2049',
    masterFormat: '4K Dolby Vision · Spatial Audio',
    audioLanguages: 'Hindi (Original), English, Japanese Dub',
    subtitles: '32 Global Subtitle Tracks',
    targetReleaseDate: '2027-05-15',
    director: 'Vasan Bala',
    tone: 'cyan',
    logline: 'Futuristic thriller set in dystopian 2049 Mumbai following a synthetic rain conspiracy.'
  },
  {
    id: 'TIT-206',
    title: 'Echoes of Mumbai Nights',
    category: 'Movie',
    seasons: 'Anthology Film',
    episodes: 4,
    runtime: '112 minutes',
    releaseType: 'Loop Exclusive',
    platform: 'LoopKids',
    genre: 'Romance / Drama',
    censorRating: 'U/A 13+',
    contentStatus: 'Released',
    associatedProject: 'Echoes of Mumbai Nights',
    masterFormat: '4K UHD · Stereo',
    audioLanguages: 'Hindi, Marathi',
    subtitles: 'English',
    targetReleaseDate: '2026-10-10',
    director: 'Konkona Sen Sharma',
    tone: 'green',
    logline: 'Four evocative stories unfolding concurrently in the glowing twilight of Mumbai railway lines.'
  }
];

export const INITIAL_CAST_CREW = [
  {
    id: 'CC-301',
    name: 'Pankaj Tripathi',
    category: 'Cast',
    department: 'Acting / Cast',
    role: 'Lead Actor - SP Samarjit Rathore',
    project: 'The Last Monsoon',
    email: 'mgmt.tripathi@talentagency.in',
    phone: '+91 98201 44521',
    rate: 18000000,
    rateType: 'Project Contract',
    status: 'On Set',
    guild: 'CINTAA (Certified)',
    contractStatus: 'Contract Signed',
    agent: 'KWAN Talent Management',
    daysBooked: 42,
    dietaryNotes: 'Strict Vegetarian, warm water on set',
    tone: 'blue'
  },
  {
    id: 'CC-302',
    name: 'Radhika Apte',
    category: 'Cast',
    department: 'Acting / Cast',
    role: 'Lead Actress - Dr. Maya Lyngdoh',
    project: 'The Last Monsoon',
    email: 'radhika.team@matrixindia.in',
    phone: '+91 98112 39011',
    rate: 15000000,
    rateType: 'Project Contract',
    status: 'On Set',
    guild: 'CINTAA (Certified)',
    contractStatus: 'Contract Signed',
    agent: 'Matrix Entertainment',
    daysBooked: 38,
    dietaryNotes: 'Gluten-free, black coffee',
    tone: 'blue'
  },
  {
    id: 'CC-303',
    name: 'Vikramaditya Motwane',
    category: 'Crew',
    department: 'Direction',
    role: 'Series Director & Showrunner',
    project: 'The Last Monsoon',
    email: 'vikramaditya@andolanfilms.com',
    phone: '+91 98200 12890',
    rate: 35000000,
    rateType: 'Project Contract',
    status: 'On Set',
    guild: 'IFTDA',
    contractStatus: 'Contract Signed',
    agent: 'Direct',
    daysBooked: 75,
    dietaryNotes: 'Standard',
    tone: 'orange'
  },
  {
    id: 'CC-304',
    name: 'Rajeev Ravi',
    category: 'Crew',
    department: 'Cinematography',
    role: 'Director of Photography (DoP)',
    project: 'The Last Monsoon',
    email: 'rajeev.dop@cinemaoptic.in',
    phone: '+91 94471 22841',
    rate: 175000,
    rateType: 'Daily Rate',
    status: 'On Set',
    guild: 'ISC / WICA',
    contractStatus: 'Contract Signed',
    agent: 'Cinematographers Guild',
    daysBooked: 45,
    dietaryNotes: 'South Indian meals preferred',
    tone: 'orange'
  },
  {
    id: 'CC-305',
    name: 'Manoj Bajpayee',
    category: 'Cast',
    department: 'Acting / Cast',
    role: 'Lead Protagonist - Kabir Anand',
    project: 'City of Echoes',
    email: 'office.mb@starworks.in',
    phone: '+91 98205 77123',
    rate: 22000000,
    rateType: 'Project Contract',
    status: 'Wrapped',
    guild: 'CINTAA (Certified)',
    contractStatus: 'Contract Signed',
    agent: 'Exceed Entertainment',
    daysBooked: 34,
    dietaryNotes: 'Vegetarian',
    tone: 'green'
  },
  {
    id: 'CC-306',
    name: 'Sneha Khanwalkar',
    category: 'Crew',
    department: 'Sound & Music',
    role: 'Original Background Score & Sound Design',
    project: 'City of Echoes',
    email: 'sneha@soundlabmumbai.com',
    phone: '+91 98334 11980',
    rate: 4500000,
    rateType: 'Project Contract',
    status: 'In Studio',
    guild: 'IPRS',
    contractStatus: 'Contract Signed',
    agent: 'Soundtrack Management',
    daysBooked: 30,
    dietaryNotes: 'Vegan',
    tone: 'purple'
  },
  {
    id: 'CC-307',
    name: 'Sham Kaushal',
    category: 'Crew',
    department: 'Stunts / Action',
    role: 'Stunt Coordinator & Action Director',
    project: 'Shadows of Varanasi',
    email: 'shamkaushal@actioncinema.com',
    phone: '+91 98210 55670',
    rate: 250000,
    rateType: 'Daily Rate',
    status: 'Rehearsals',
    guild: 'Movie Stunt Artists Association',
    contractStatus: 'Contract Signed',
    agent: 'Action Crew Guild',
    daysBooked: 22,
    dietaryNotes: 'High-protein diet',
    tone: 'orange'
  },
  {
    id: 'CC-308',
    name: 'Sobhita Dhulipala',
    category: 'Cast',
    department: 'Acting / Cast',
    role: 'Lead - Archeologist Gayatri Sen',
    project: 'Shadows of Varanasi',
    email: 'sobhita.mgmt@culturecorp.in',
    phone: '+91 99302 44199',
    rate: 12000000,
    rateType: 'Project Contract',
    status: 'Available',
    guild: 'CINTAA',
    contractStatus: 'In Negotiation',
    agent: 'Culture Corp',
    daysBooked: 28,
    dietaryNotes: 'Nut allergy, black tea',
    tone: 'purple'
  },
  {
    id: 'CC-309',
    name: 'Wasiq Khan',
    category: 'Crew',
    department: 'Production Design',
    role: 'Head Production Designer',
    project: 'Project Kaal: 2049',
    email: 'wasiq.khan@artdeptfilms.in',
    phone: '+91 98202 38812',
    rate: 6500000,
    rateType: 'Project Contract',
    status: 'In Studio',
    guild: 'Art Directors Guild of India',
    contractStatus: 'Contract Signed',
    agent: 'Art Dept Agency',
    daysBooked: 60,
    dietaryNotes: 'Standard',
    tone: 'cyan'
  }
];

export const INITIAL_EPISODES = [
  {
    id: 'EP-401',
    project: 'The Last Monsoon',
    episodeNumber: 1,
    title: 'The Cloudburst',
    runtime: '54 mins',
    status: 'Completed',
    director: 'Vikramaditya Motwane',
    writer: 'Varun Grover',
    targetAirDate: '2026-11-18',
    synopsis: 'A flash flood in Cherrapunji exposes an abandoned submerged vehicle containing government radio transmitter codebooks from 1998.',
    scenesCount: 28,
    scenesCompleted: 28,
    tone: 'blue'
  },
  {
    id: 'EP-402',
    project: 'The Last Monsoon',
    episodeNumber: 2,
    title: 'Submerged Secrets',
    runtime: '49 mins',
    status: 'Sound & VFX',
    director: 'Vikramaditya Motwane',
    writer: 'Varun Grover',
    targetAirDate: '2026-11-18',
    synopsis: 'SP Samarjit discovers the submerged vehicle was logged as scrapped 24 years ago, while Dr. Maya uncovers contradictory forensic evidence.',
    scenesCount: 24,
    scenesCompleted: 24,
    tone: 'blue'
  },
  {
    id: 'EP-403',
    project: 'The Last Monsoon',
    episodeNumber: 3,
    title: 'Water Trails',
    runtime: '51 mins',
    status: 'Shooting',
    director: 'Vikramaditya Motwane',
    writer: 'Smita Singh',
    targetAirDate: '2026-11-18',
    synopsis: 'As continuous rains cut off the bridge to the state capital, an armed ambush at the checkpost reveals a mole inside local dispatch.',
    scenesCount: 26,
    scenesCompleted: 21,
    tone: 'orange'
  },
  {
    id: 'EP-404',
    project: 'The Last Monsoon',
    episodeNumber: 4,
    title: 'Dead Air',
    runtime: '48 mins',
    status: 'Shooting',
    director: 'Vikramaditya Motwane',
    writer: 'Smita Singh',
    targetAirDate: '2026-11-18',
    synopsis: 'With radio towers down, the precinct must transport a high-value eyewitness across swollen river valleys on an unmapped mining rail track.',
    scenesCount: 22,
    scenesCompleted: 14,
    tone: 'orange'
  },
  {
    id: 'EP-405',
    project: 'Project Kaal: 2049',
    episodeNumber: 1,
    title: 'Dry Horizon',
    runtime: '58 mins',
    status: 'Script Locked',
    director: 'Vasan Bala',
    writer: 'Vasan Bala & Rohan Ghose',
    targetAirDate: '2027-05-15',
    synopsis: 'In futuristic arid Mumbai, an atmospheric data technician intercepts an illegal encrypted weather forecast warning of an artificial thunderstorm.',
    scenesCount: 30,
    scenesCompleted: 5,
    tone: 'purple'
  },
  {
    id: 'EP-406',
    project: 'Project Kaal: 2049',
    episodeNumber: 2,
    title: 'Synthetic Dew',
    runtime: '52 mins',
    status: 'In Scripting',
    director: 'Vasan Bala',
    writer: 'Rohan Ghose',
    targetAirDate: '2027-05-15',
    synopsis: 'Underground cyber runner Maya infiltrates the SkyWell Corporate Desalination Tower to steal raw precipitation filters.',
    scenesCount: 25,
    scenesCompleted: 0,
    tone: 'purple'
  }
];

export const INITIAL_SCENES = [
  {
    id: 'SCN-501',
    project: 'The Last Monsoon',
    episodeId: 'EP-401',
    episodeName: 'EP 1 · The Cloudburst',
    sceneNumber: 'Scene 01A',
    heading: 'EXT. CHERRAPUNJI FOREST GORGE - NIGHT [RAIN]',
    setting: 'EXT',
    timeOfDay: 'NIGHT',
    pages: '2 3/8',
    location: 'Nohkalikai Falls Lower Valley, Cherrapunji',
    characters: 'SP Samarjit Rathore, SI Bodo, Driver',
    status: 'Shot / Done',
    shootDate: '2026-07-02',
    equipment: 'Arri Alexa Mini LF, Water Housing, Hydro Rain Machine, 100kW Generator',
    description: 'Torrential downpour cascades over mud cliff edge. Samarjit steps out into torrential rain flashlight illuminating the half-submerged steel chassis in the canyon water.',
    tone: 'green'
  },
  {
    id: 'SCN-502',
    project: 'The Last Monsoon',
    episodeId: 'EP-401',
    episodeName: 'EP 1 · The Cloudburst',
    sceneNumber: 'Scene 04B',
    heading: 'INT. POLICE PRECINCT DISPATCH ROOM - NIGHT',
    setting: 'INT',
    timeOfDay: 'NIGHT',
    pages: '3 1/8',
    location: 'Sohra Police Station Set (Floor 2)',
    characters: 'Dr. Maya Lyngdoh, SP Samarjit, Dispatch Officer',
    status: 'Shot / Done',
    shootDate: '2026-07-04',
    equipment: 'Cooke Anamorphic /i Prime, Low Key Kino Flo, Fog Atmosphere',
    description: 'Dr. Maya unseals rusted metal cashbox recovered from vehicle trunk, finding handwritten police log numbers dated October 1998.',
    tone: 'green'
  },
  {
    id: 'SCN-503',
    project: 'The Last Monsoon',
    episodeId: 'EP-403',
    episodeName: 'EP 3 · Water Trails',
    sceneNumber: 'Scene 14',
    heading: 'EXT. SUSPENSION CABLE BRIDGE - DUSK [FOG]',
    setting: 'EXT',
    timeOfDay: 'DUSK',
    pages: '4 2/8',
    location: 'Wahkhen Village Hanging Bridge',
    characters: 'SP Samarjit, Informant, 3 Armed Operatives',
    status: 'In Progress',
    shootDate: '2026-10-31',
    equipment: 'Heavy Drone Ronin 4D, Wire Rigging, Stunt Safety Nets, Blank Firearms',
    description: 'High-tension confrontation on creaking bamboo suspension bridge enveloped in dense mountain fog. Gunfire cuts support tether.',
    tone: 'orange'
  },
  {
    id: 'SCN-504',
    project: 'The Last Monsoon',
    episodeId: 'EP-403',
    episodeName: 'EP 3 · Water Trails',
    sceneNumber: 'Scene 18',
    heading: 'INT. FOREST RANGER LOG CABIN - DAWN',
    setting: 'INT',
    timeOfDay: 'DAWN',
    pages: '1 6/8',
    location: 'Mawsmai Ridge Outpost Set',
    characters: 'Dr. Maya Lyngdoh, Injured Constable',
    status: 'Scheduled',
    shootDate: '2026-11-04',
    equipment: 'Steadicam, Warm Tungsten Practical Lighting, Blood FX Kit',
    description: 'Maya performs emergency field suture under battering rain on cabin tin roof while radio crackles broken static codes.',
    tone: 'blue'
  },
  {
    id: 'SCN-505',
    project: 'City of Echoes',
    episodeId: 'FEATURE',
    episodeName: 'Feature Film Master',
    sceneNumber: 'Scene 32',
    heading: 'INT. OLD DELHI SAFE HOUSE - DUSK',
    setting: 'INT',
    timeOfDay: 'DUSK',
    pages: '3 5/8',
    location: 'Chandni Chowk Haveli Interior, Delhi',
    characters: 'Kabir Anand, Minister Secretary',
    status: 'Shot / Done',
    shootDate: '2026-04-18',
    equipment: 'Red V-Raptor 8K, Vintage Zeiss Super Speeds, Smoke Machine',
    description: 'Shadowy confrontation over encrypted wiretap tapes with city sirens audible through antique louvered shutters.',
    tone: 'green'
  },
  {
    id: 'SCN-506',
    project: 'Shadows of Varanasi',
    episodeId: 'FEATURE',
    episodeName: 'Feature Film Master',
    sceneNumber: 'Scene 08C',
    heading: 'EXT. ASSI GHAT RIVER STEPS - DAWN [MIST]',
    setting: 'EXT',
    timeOfDay: 'DAWN',
    pages: '5 0/8',
    location: 'Assi Ghat & River Barge, Varanasi',
    characters: 'Archeologist Gayatri Sen, Detective Devdutt, 20 Monks Extras',
    status: 'Scheduled',
    shootDate: '2026-11-15',
    equipment: 'Technocrane 50ft, Underwater Hydrophone, IMAX Digital Camera Unit',
    description: 'Morning prayer bells ring across river Ganga as deep river diving team resurfaces with carved stone copper seal.',
    tone: 'orange'
  }
];

// Helper: Format Indian Rupee currency nicely
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

// Loop Platform brand tiers: LoopNexus and LoopKids
export const LOOP_PLATFORMS = [
  'LoopNexus',
  'LoopKids'
];

export function normalizeLoopPlatform(platform, itemId = '') {
  if (!platform) return 'LoopNexus';
  const p = String(platform).trim().toLowerCase();
  if (p === 'loopkids' || p.includes('kids')) return 'LoopKids';
  if (p === 'loopnexus' || p.includes('nexus')) return 'LoopNexus';

  // Content mapped to LoopKids:
  // PRJ-103 / TIT-203 (Beyond The Frame - U Universal family/art documentary)
  // PRJ-106 / TIT-206 (Echoes of Mumbai Nights)
  const idStr = String(itemId).toUpperCase();
  if (idStr.includes('103') || idStr.includes('203') || idStr.includes('106') || idStr.includes('206')) {
    return 'LoopKids';
  }

  if (p.includes('disney') || p.includes('stream') || p.includes('exclusive') || p.includes('jio')) {
    if (idStr.includes('103') || idStr.includes('203') || idStr.includes('106') || idStr.includes('206')) {
      return 'LoopKids';
    }
  }

  return 'LoopNexus';
}

// ================= PROJECTS STORAGE ================= //

export function getStoredProjects() {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PROJECTS;
    let modified = false;
    const normalized = list.map(p => {
      const norm = normalizeLoopPlatform(p.platform, p.id);
      if (norm !== p.platform) {
        modified = true;
        return { ...p, platform: norm };
      }
      return p;
    });
    if (modified) {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch (err) {
    console.error('Failed to load projects from storage:', err);
    return INITIAL_PROJECTS;
  }
}

export function saveProjects(projects) {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to storage:', err);
  }
}

export function createProject(data) {
  const current = getStoredProjects();
  const nextIdNum = current.reduce((max, p) => {
    const num = parseInt(p.id?.replace(/\D/g, '') || '0', 10);
    return num > max ? num : max;
  }, 100) + 1;

  const newProject = {
    id: `PRJ-${nextIdNum}`,
    code: data.code || `PRJ-${nextIdNum}`,
    name: data.name || 'Untitled Production',
    type: data.type || 'Feature Film',
    genre: data.genre || 'Drama',
    status: data.status || 'Development',
    stage: data.stage || 'Concept & Development',
    progress: Number(data.progress || 0),
    budget: Number(data.budget || 0),
    spent: Number(data.spent || 0),
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    targetDeliveryDate: data.targetDeliveryDate || '',
    director: data.director || 'Unassigned',
    producer: data.producer || 'Studio North',
    location: data.location || 'Studio Lot',
    platform: normalizeLoopPlatform(data.platform) || 'LoopNexus',
    tone: data.tone || 'blue',
    synopsis: data.synopsis || ''
  };

  const updated = [newProject, ...current];
  saveProjects(updated);
  return { project: newProject, all: updated };
}

export function updateProject(id, updates) {
  const current = getStoredProjects();
  const updated = current.map(p => {
    if (p.id === id) {
      return {
        ...p,
        ...updates,
        progress: updates.progress !== undefined ? Number(updates.progress) : p.progress,
        budget: updates.budget !== undefined ? Number(updates.budget) : p.budget,
        spent: updates.spent !== undefined ? Number(updates.spent) : p.spent
      };
    }
    return p;
  });
  saveProjects(updated);
  return updated;
}

export function deleteProject(id) {
  const current = getStoredProjects();
  const updated = current.filter(p => p.id !== id);
  saveProjects(updated);
  return updated;
}

// ================= TITLES (MOVIES & WEB SERIES) STORAGE ================= //

export function getStoredTitles() {
  try {
    const raw = localStorage.getItem(TITLES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TITLES_STORAGE_KEY, JSON.stringify(INITIAL_TITLES));
      return INITIAL_TITLES;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TITLES;
    let modified = false;
    const normalized = list.map(t => {
      const norm = normalizeLoopPlatform(t.platform, t.id);
      if (norm !== t.platform) {
        modified = true;
        return { ...t, platform: norm };
      }
      return t;
    });
    if (modified) {
      localStorage.setItem(TITLES_STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch (err) {
    console.error('Failed to load titles from storage:', err);
    return INITIAL_TITLES;
  }
}

export function saveTitles(titles) {
  try {
    localStorage.setItem(TITLES_STORAGE_KEY, JSON.stringify(titles));
  } catch (err) {
    console.error('Failed to save titles to storage:', err);
  }
}

export function createTitle(data) {
  const current = getStoredTitles();
  const nextIdNum = current.reduce((max, t) => {
    const num = parseInt(t.id?.replace(/\D/g, '') || '0', 10);
    return num > max ? num : max;
  }, 200) + 1;

  const newTitle = {
    id: `TIT-${nextIdNum}`,
    title: data.title || 'Untitled Title',
    category: data.category || 'Movie',
    seasons: data.category === 'Web Series' ? (data.seasons || 'Season 1') : 'Feature Film',
    episodes: Number(data.episodes || 1),
    runtime: data.runtime || (data.category === 'Web Series' ? `${data.episodes || 8} Episodes` : '120 minutes'),
    releaseType: data.releaseType || 'Loop Exclusive',
    platform: normalizeLoopPlatform(data.platform) || 'LoopNexus',
    genre: data.genre || 'Drama',
    censorRating: data.censorRating || 'U/A 16+',
    contentStatus: data.contentStatus || 'In Scripting',
    associatedProject: data.associatedProject || 'None',
    masterFormat: data.masterFormat || '4K UHD · 5.1 Surround',
    audioLanguages: data.audioLanguages || 'Hindi (Original)',
    subtitles: data.subtitles || 'English',
    targetReleaseDate: data.targetReleaseDate || '',
    director: data.director || 'Unassigned',
    tone: data.tone || 'orange',
    logline: data.logline || ''
  };

  const updated = [newTitle, ...current];
  saveTitles(updated);
  return { title: newTitle, all: updated };
}

export function updateTitle(id, updates) {
  const current = getStoredTitles();
  const updated = current.map(t => {
    if (t.id === id) {
      return {
        ...t,
        ...updates,
        episodes: updates.episodes !== undefined ? Number(updates.episodes) : t.episodes
      };
    }
    return t;
  });
  saveTitles(updated);
  return updated;
}

export function deleteTitle(id) {
  const current = getStoredTitles();
  const updated = current.filter(t => t.id !== id);
  saveTitles(updated);
  return updated;
}

// ================= CAST & CREW STORAGE ================= //

export function getStoredCastCrew() {
  try {
    const raw = localStorage.getItem(CAST_CREW_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CAST_CREW_STORAGE_KEY, JSON.stringify(INITIAL_CAST_CREW));
      return INITIAL_CAST_CREW;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CAST_CREW;
  } catch (err) {
    console.error('Failed to load cast & crew from storage:', err);
    return INITIAL_CAST_CREW;
  }
}

export function saveCastCrew(list) {
  try {
    localStorage.setItem(CAST_CREW_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save cast & crew to storage:', err);
  }
}

export function createCastCrew(data) {
  const current = getStoredCastCrew();
  const nextIdNum = current.reduce((max, c) => {
    const num = parseInt(c.id?.replace(/\D/g, '') || '0', 10);
    return num > max ? num : max;
  }, 300) + 1;

  const newMember = {
    id: `CC-${nextIdNum}`,
    name: data.name || 'Unnamed Professional',
    category: data.category || 'Cast',
    department: data.department || (data.category === 'Cast' ? 'Acting / Cast' : 'Production'),
    role: data.role || 'Supporting Artist / Technician',
    project: data.project || 'General Roster',
    email: data.email || '',
    phone: data.phone || '',
    rate: Number(data.rate || 0),
    rateType: data.rateType || 'Project Contract',
    status: data.status || 'Available',
    guild: data.guild || 'None',
    contractStatus: data.contractStatus || 'Draft',
    agent: data.agent || 'Direct',
    daysBooked: Number(data.daysBooked || 0),
    dietaryNotes: data.dietaryNotes || 'Standard',
    tone: data.category === 'Cast' ? 'blue' : 'orange'
  };

  const updated = [newMember, ...current];
  saveCastCrew(updated);
  return { member: newMember, all: updated };
}

export function updateCastCrew(id, updates) {
  const current = getStoredCastCrew();
  const updated = current.map(c => {
    if (c.id === id) {
      return {
        ...c,
        ...updates,
        rate: updates.rate !== undefined ? Number(updates.rate) : c.rate,
        daysBooked: updates.daysBooked !== undefined ? Number(updates.daysBooked) : c.daysBooked
      };
    }
    return c;
  });
  saveCastCrew(updated);
  return updated;
}

export function deleteCastCrew(id) {
  const current = getStoredCastCrew();
  const updated = current.filter(c => c.id !== id);
  saveCastCrew(updated);
  return updated;
}

// ================= EPISODES STORAGE ================= //

export function getStoredEpisodes() {
  try {
    const raw = localStorage.getItem(EPISODES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EPISODES_STORAGE_KEY, JSON.stringify(INITIAL_EPISODES));
      return INITIAL_EPISODES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_EPISODES;
  } catch (err) {
    console.error('Failed to load episodes from storage:', err);
    return INITIAL_EPISODES;
  }
}

export function saveEpisodes(list) {
  try {
    localStorage.setItem(EPISODES_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save episodes to storage:', err);
  }
}

export function createEpisode(data) {
  const current = getStoredEpisodes();
  const nextIdNum = current.reduce((max, ep) => {
    const num = parseInt(ep.id?.replace(/\D/g, '') || '0', 10);
    return num > max ? num : max;
  }, 400) + 1;

  const newEpisode = {
    id: `EP-${nextIdNum}`,
    project: data.project || 'Untitled Series',
    episodeNumber: Number(data.episodeNumber || current.length + 1),
    title: data.title || `Episode ${data.episodeNumber || current.length + 1}`,
    runtime: data.runtime || '45 mins',
    status: data.status || 'Script Locked',
    director: data.director || 'Unassigned',
    writer: data.writer || 'Unassigned',
    targetAirDate: data.targetAirDate || '',
    synopsis: data.synopsis || '',
    scenesCount: Number(data.scenesCount || 0),
    scenesCompleted: Number(data.scenesCompleted || 0),
    tone: data.status === 'Completed' ? 'green' : data.status === 'Shooting' ? 'orange' : 'blue'
  };

  const updated = [newEpisode, ...current];
  saveEpisodes(updated);
  return { episode: newEpisode, all: updated };
}

export function updateEpisode(id, updates) {
  const current = getStoredEpisodes();
  const updated = current.map(ep => {
    if (ep.id === id) {
      return {
        ...ep,
        ...updates,
        episodeNumber: updates.episodeNumber !== undefined ? Number(updates.episodeNumber) : ep.episodeNumber,
        scenesCount: updates.scenesCount !== undefined ? Number(updates.scenesCount) : ep.scenesCount,
        scenesCompleted: updates.scenesCompleted !== undefined ? Number(updates.scenesCompleted) : ep.scenesCompleted
      };
    }
    return ep;
  });
  saveEpisodes(updated);
  return updated;
}

export function deleteEpisode(id) {
  const current = getStoredEpisodes();
  const updated = current.filter(ep => ep.id !== id);
  saveEpisodes(updated);
  return updated;
}

// ================= SCENES STORAGE ================= //

export function getStoredScenes() {
  try {
    const raw = localStorage.getItem(SCENES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SCENES_STORAGE_KEY, JSON.stringify(INITIAL_SCENES));
      return INITIAL_SCENES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SCENES;
  } catch (err) {
    console.error('Failed to load scenes from storage:', err);
    return INITIAL_SCENES;
  }
}

export function saveScenes(list) {
  try {
    localStorage.setItem(SCENES_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save scenes to storage:', err);
  }
}

export function createScene(data) {
  const current = getStoredScenes();
  const nextIdNum = current.reduce((max, sc) => {
    const num = parseInt(sc.id?.replace(/\D/g, '') || '0', 10);
    return num > max ? num : max;
  }, 500) + 1;

  const newScene = {
    id: `SCN-${nextIdNum}`,
    project: data.project || 'Untitled Production',
    episodeId: data.episodeId || 'EP-401',
    episodeName: data.episodeName || 'Episode / Feature',
    sceneNumber: data.sceneNumber || `Scene ${current.length + 1}`,
    heading: data.heading || 'INT. STAGE 1 - DAY',
    setting: data.setting || 'INT',
    timeOfDay: data.timeOfDay || 'DAY',
    pages: data.pages || '1 0/8',
    location: data.location || 'Studio Floor',
    characters: data.characters || 'Cast Lead',
    status: data.status || 'Scheduled',
    shootDate: data.shootDate || '',
    equipment: data.equipment || 'Standard Camera Package',
    description: data.description || '',
    tone: data.status === 'Shot / Done' ? 'green' : data.status === 'In Progress' ? 'orange' : 'blue'
  };

  const updated = [newScene, ...current];
  saveScenes(updated);
  return { scene: newScene, all: updated };
}

export function updateScene(id, updates) {
  const current = getStoredScenes();
  const updated = current.map(sc => {
    if (sc.id === id) {
      return {
        ...sc,
        ...updates
      };
    }
    return sc;
  });
  saveScenes(updated);
  return updated;
}

export function deleteScene(id) {
  const current = getStoredScenes();
  const updated = current.filter(sc => sc.id !== id);
  saveScenes(updated);
  return updated;
}
