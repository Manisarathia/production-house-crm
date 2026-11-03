// Storage and Data Service for Media, Audio & Legal Management
// Pure backend-compatible storage with ZERO mock data.

import { formatCurrency, normalizeLoopPlatform } from './productionStorage.js';

export const POST_PROD_STORAGE_KEY = 'loopstream_crm_post_production';
export const MEDIA_ASSETS_STORAGE_KEY = 'loopstream_crm_media_assets';
export const SINGERS_STORAGE_KEY = 'loopstream_crm_singers';
export const DUBBING_STORAGE_KEY = 'loopstream_crm_dubbing';
export const CONTRACTS_STORAGE_KEY = 'loopstream_crm_contracts';
export const RIGHTS_STORAGE_KEY = 'loopstream_crm_rights';

// Pure empty initial lists - zero mock data
export const INITIAL_POST_PRODUCTION = [];
export const INITIAL_MEDIA_ASSETS = [];
export const INITIAL_SINGERS = [];
export const INITIAL_DUBBING = [];
export const INITIAL_CONTRACTS = [];
export const INITIAL_RIGHTS = [];

const MOCK_IDS = new Set([
  'PST-101', 'PST-102', 'PST-103', 'PST-104', 'PST-105', 'PST-106',
  'AST-201', 'AST-202', 'AST-203', 'AST-204', 'AST-205', 'AST-206',
  'SNG-301', 'SNG-302', 'SNG-303', 'SNG-304', 'SNG-305', 'SNG-306',
  'DUB-401', 'DUB-402', 'DUB-403', 'DUB-404', 'DUB-405', 'DUB-406',
  'CTR-501', 'CTR-502', 'CTR-503', 'CTR-504', 'CTR-505', 'CTR-506',
  'CON-501', 'CON-502', 'CON-503', 'CON-504', 'CON-505', 'CON-506',
  'RGT-601', 'RGT-602', 'RGT-603', 'RGT-604', 'RGT-605', 'RGT-606'
]);

const MOCK_TITLES = new Set([
  'baarish ke saaye', 'raat ka shehar', 'ganga ke kinare', 'kashi ki galiyan', 'waqt ki deewar', 'kaal chakra',
  'dolby vision color grading & di master', 'dolby atmos 7.1.4 surround sound mix & foley',
  'archival 35mm celluloid 4k scan & deflicker', 'vfx compositing - river sequence (186 shots)',
  'offline assembly edit - final director cut', 'master imf qc & netflix deliverable validation',
  'lead talent agreement - manoj bajpayee', 'director service agreement - anurag kashyap',
  'original soundtrack master synchronization pact', 'post-production visual effects turnkey agreement',
  'exclusive ott platform streaming license (worldwide)', 'writer bible & screenplay development assignment',
  'exclusive worldwide svod & streaming rights', 'theatrical exhibition & commercial distribution (india saarc)',
  'linear satellite television broadcast rights', 'in-flight & maritime commercial screening license',
  'global non-exclusive academic & archival rights'
]);

export function filterOutMockData(list) {
  if (!Array.isArray(list)) return [];
  return list.filter(item => {
    if (!item || typeof item !== 'object') return false;
    if (MOCK_IDS.has(item.id)) return false;
    const t = (item.title || item.songTitle || item.name || '').trim().toLowerCase();
    if (MOCK_TITLES.has(t)) return false;
    return true;
  });
}

// 1. Post-Production Storage
export function getStoredPostProduction() {
  try {
    const raw = localStorage.getItem(POST_PROD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const cleaned = filterOutMockData(parsed);
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(POST_PROD_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function savePostProduction(list) {
  try {
    const cleaned = filterOutMockData(list);
    localStorage.setItem(POST_PROD_STORAGE_KEY, JSON.stringify(cleaned));
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
    project: data.project || 'General',
    title: data.title || 'Untitled Post Task',
    stage: data.stage || 'Color Grading (DI)',
    supervisor: data.supervisor || 'In-House Post',
    leadArtist: data.leadArtist || 'Lead Artist',
    facility: data.facility || 'In-House Studio',
    progress: Number(data.progress || 0),
    status: data.status || 'In Progress',
    targetDeliveryDate: data.targetDeliveryDate || '',
    reelsCount: data.reelsCount || '1 Reel',
    qcStatus: data.qcStatus || 'Under Review',
    platform: normalizeLoopPlatform(data.platform),
    tone: data.status === 'Approved' ? 'green' : data.status === 'Pending Review' ? 'orange' : 'blue',
    notes: data.notes || '',
    image: data.image || ''
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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const cleaned = filterOutMockData(parsed);
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(MEDIA_ASSETS_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveMediaAssets(list) {
  try {
    const cleaned = filterOutMockData(list);
    localStorage.setItem(MEDIA_ASSETS_STORAGE_KEY, JSON.stringify(cleaned));
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
    project: data.project || 'General',
    assetType: data.assetType || 'Master Cut',
    resolution: data.resolution || '4K UHD (3840x2160)',
    codecFormat: data.codecFormat || 'Apple ProRes 4444 XQ',
    fileSize: data.fileSize || '10.0 GB',
    version: data.version || 'v1.0',
    storageLocation: data.storageLocation || 'Loop Cloud Vault',
    checksum: data.checksum || `sha256:${Math.random().toString(16).substring(2, 10)}`,
    status: data.status || 'QC Passed',
    uploadedBy: data.uploadedBy || 'Studio North Post',
    uploadDate: data.uploadDate || new Date().toISOString().split('T')[0],
    platform: normalizeLoopPlatform(data.platform),
    tone: data.status === 'QC Passed' ? 'green' : data.status === 'Under Review' ? 'orange' : 'blue',
    accessUrl: data.accessUrl || '',
    image: data.image || ''
  };

  const updated = [newItem, ...current];
  saveMediaAssets(updated);
  return { item: newItem, all: updated };
}

export function updateMediaAsset(id, updates) {
  const current = getStoredMediaAssets();
  const updated = current.map(item => (item.id === id ? { ...item, ...updates } : item));
  saveMediaAssets(updated);
  return updated;
}

export function deleteMediaAsset(id) {
  const current = getStoredMediaAssets();
  const updated = current.filter(item => item.id !== id);
  saveMediaAssets(updated);
  return updated;
}

// 3. Singers Storage
export function getStoredSingers() {
  try {
    const raw = localStorage.getItem(SINGERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const cleaned = filterOutMockData(parsed);
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(SINGERS_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveSingers(list) {
  try {
    const cleaned = filterOutMockData(list);
    localStorage.setItem(SINGERS_STORAGE_KEY, JSON.stringify(cleaned));
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
    project: data.project || 'General',
    singerName: data.singerName || 'Lead Vocalist',
    vocalType: data.vocalType || 'Lead Vocalist',
    language: data.language || 'Hindi',
    musicDirector: data.musicDirector || 'In-House Composer',
    lyricist: data.lyricist || 'Traditional',
    duration: data.duration || '3 mins 30 secs',
    recordingStudio: data.recordingStudio || 'Studio Sound Lab',
    recordingStatus: data.recordingStatus || 'Mastered & Mixed',
    fee: Number(data.fee || 0),
    isrcCode: data.isrcCode || `IN-L01-26-00${nextIdNum}`,
    releaseDate: data.releaseDate || new Date().toISOString().split('T')[0],
    platform: normalizeLoopPlatform(data.platform),
    tone: data.recordingStatus === 'Mastered & Mixed' ? 'green' : 'orange',
    image: data.image || ''
  };

  const updated = [newItem, ...current];
  saveSingers(updated);
  return { item: newItem, all: updated };
}

export function updateSinger(id, updates) {
  const current = getStoredSingers();
  const updated = current.map(item => (item.id === id ? { ...item, ...updates } : item));
  saveSingers(updated);
  return updated;
}

export function deleteSinger(id) {
  const current = getStoredSingers();
  const updated = current.filter(item => item.id !== id);
  saveSingers(updated);
  return updated;
}

// 4. Dubbing Storage
export function getStoredDubbing() {
  try {
    const raw = localStorage.getItem(DUBBING_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const cleaned = filterOutMockData(parsed);
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(DUBBING_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveDubbing(list) {
  try {
    const cleaned = filterOutMockData(list);
    localStorage.setItem(DUBBING_STORAGE_KEY, JSON.stringify(cleaned));
  } catch (err) {
    console.error('Failed to save dubbing data:', err);
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
    characterName: data.characterName || 'Lead Character',
    project: data.project || 'General',
    targetLanguage: data.targetLanguage || 'Tamil',
    voiceArtist: data.voiceArtist || 'Voice Artist',
    dubbingDirector: data.dubbingDirector || 'Sound Lab Director',
    studioFacility: data.studioFacility || 'Sound & Vision India',
    sessionDate: data.sessionDate || new Date().toISOString().split('T')[0],
    sessionTime: data.sessionTime || '10:00 AM - 02:00 PM',
    reelsOrEpisodes: data.reelsOrEpisodes || 'Reels 1-4',
    timecode: data.timecode || '00:00:00:00 - 02:00:00:00',
    status: data.status || 'Scheduled',
    lipsyncQuality: data.lipsyncQuality || 'Passed Sync Check',
    platform: normalizeLoopPlatform(data.platform),
    tone: data.status === 'Completed' ? 'green' : data.status === 'In Progress' ? 'orange' : 'blue',
    image: data.image || ''
  };

  const updated = [newItem, ...current];
  saveDubbing(updated);
  return { item: newItem, all: updated };
}

export function updateDubbing(id, updates) {
  const current = getStoredDubbing();
  const updated = current.map(item => (item.id === id ? { ...item, ...updates } : item));
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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const cleaned = filterOutMockData(parsed);
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveContracts(list) {
  try {
    const cleaned = filterOutMockData(list);
    localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(cleaned));
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
    project: data.project || 'General',
    counterparty: data.counterparty || 'Counterparty Entity',
    agreementType: data.agreementType || 'Talent / Cast Agreement',
    contractValue: Number(data.contractValue || 0),
    paymentTerms: data.paymentTerms || 'Standard Terms',
    effectiveDate: data.effectiveDate || new Date().toISOString().split('T')[0],
    expiryDate: data.expiryDate || '',
    status: data.status || 'Executed / Signed',
    legalSignatory: data.legalSignatory || 'Authorized Signatory',
    governingLaw: data.governingLaw || 'High Court of Bombay, Mumbai',
    fileAttachment: data.fileAttachment || '',
    platform: normalizeLoopPlatform(data.platform),
    tone: data.status === 'Executed / Signed' ? 'green' : 'orange',
    image: data.image || ''
  };

  const updated = [newItem, ...current];
  saveContracts(updated);
  return { item: newItem, all: updated };
}

export function updateContract(id, updates) {
  const current = getStoredContracts();
  const updated = current.map(item => (item.id === id ? { ...item, ...updates } : item));
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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const cleaned = filterOutMockData(parsed);
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(RIGHTS_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveRights(list) {
  try {
    const cleaned = filterOutMockData(list);
    localStorage.setItem(RIGHTS_STORAGE_KEY, JSON.stringify(cleaned));
  } catch (err) {
    console.error('Failed to save rights data:', err);
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
    project: data.project || 'General',
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
    restrictions: data.restrictions || '',
    tone: data.status === 'Active' ? 'green' : 'orange',
    image: data.image || ''
  };

  const updated = [newItem, ...current];
  saveRights(updated);
  return { item: newItem, all: updated };
}

export function updateRight(id, updates) {
  const current = getStoredRights();
  const updated = current.map(item => (item.id === id ? { ...item, ...updates } : item));
  saveRights(updated);
  return updated;
}

export function deleteRight(id) {
  const current = getStoredRights();
  const updated = current.filter(item => item.id !== id);
  saveRights(updated);
  return updated;
}
