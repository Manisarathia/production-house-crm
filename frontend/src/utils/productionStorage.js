// Production House CRM - Storage & Data Service for Projects, Titles, Cast & Crew, Episodes & Scenes
// Persists all production data in localStorage with full CRUD capabilities.

const PROJECTS_STORAGE_KEY = 'loopstream_crm_projects';
const TITLES_STORAGE_KEY = 'loopstream_crm_titles';
const CAST_CREW_STORAGE_KEY = 'loopstream_crm_cast_crew';
const EPISODES_STORAGE_KEY = 'loopstream_crm_episodes';
const SCENES_STORAGE_KEY = 'loopstream_crm_scenes';

export const INITIAL_PROJECTS = [];

export const INITIAL_TITLES = [];

export const INITIAL_CAST_CREW = [];

export const INITIAL_EPISODES = [];

export const INITIAL_SCENES = [];

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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [];
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
    return [];
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
    if (!raw) return [];
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
    return [];
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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load cast & crew from storage:', err);
    return [];
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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load episodes from storage:', err);
    return [];
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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load scenes from storage:', err);
    return [];
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

// Re-export Media, Audio & Legal Management storage services
export * from './mediaAudioLegalStorage.js';

