import {
  getStoredProjects,
  createProject,
  updateProject,
  deleteProject,
  getStoredTitles,
  createTitle,
  updateTitle,
  deleteTitle,
  getStoredCastCrew,
  createCastCrew,
  updateCastCrew,
  deleteCastCrew,
  getStoredEpisodes,
  createEpisode,
  updateEpisode,
  deleteEpisode,
  getStoredScenes,
  createScene,
  updateScene,
  deleteScene
} from './productionStorage.js';

const configuredBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080')
  .trim()
  .replace(/\/+$/, '');

const BASE = /\/api\/production$/.test(configuredBase)
  ? configuredBase
  : /\/api$/.test(configuredBase)
    ? `${configuredBase}/production`
    : `${configuredBase}/api/production`;

function handleLocalStorageFallback(path, method = 'GET', data) {
  const [basePath] = path.split('?');
  const parts = basePath.split('/').filter(Boolean);
  const resource = parts[0];
  const id = parts[1] ? decodeURIComponent(parts[1]) : undefined;

  switch (resource) {
    case 'projects': {
      if (method === 'GET') {
        const list = getStoredProjects();
        return list.map(p => ({
          ...p,
          id: p.id,
          name: p.name || p.title || 'Untitled Project',
          title: p.title || p.name || 'Untitled Project',
          code: p.code || (p.id ? `PRJ-${String(p.id).substring(0, 4).toUpperCase()}` : 'PRJ-TEMP'),
          stage: p.stage || 'In Production',
          status: p.status || 'In Production'
        }));
      }
      if (method === 'POST') {
        const res = createProject(data);
        return res?.project || res;
      }
      if (method === 'PUT' && id) {
        return updateProject(id, data);
      }
      if (method === 'DELETE' && id) {
        deleteProject(id);
        return null;
      }
      break;
    }

    case 'media-items': {
      if (method === 'GET') {
        const list = getStoredTitles();
        return list.map(t => ({
          ...t,
          id: t.id,
          title: t.title || 'Untitled Title',
          project: {
            id: t.associatedProject || 'The Last Monsoon',
            title: t.associatedProject || 'The Last Monsoon'
          },
          associatedProject: t.associatedProject || 'The Last Monsoon',
          seasonNumber: t.episodes ? 1 : null
        }));
      }
      if (method === 'POST') {
        const res = createTitle(data);
        return res?.title || res;
      }
      if (method === 'PUT' && id) {
        return updateTitle(id, data);
      }
      if (method === 'DELETE' && id) {
        deleteTitle(id);
        return null;
      }
      break;
    }

    case 'crew': {
      if (method === 'GET') {
        return getStoredCastCrew();
      }
      if (method === 'POST') {
        const res = createCastCrew(data);
        return res?.member || res;
      }
      if (method === 'PUT' && id) {
        return updateCastCrew(id, data);
      }
      if (method === 'DELETE' && id) {
        deleteCastCrew(id);
        return null;
      }
      break;
    }

    case 'episodes': {
      if (method === 'GET') {
        return getStoredEpisodes();
      }
      if (method === 'POST') {
        const res = createEpisode(data);
        return res?.episode || res;
      }
      if (method === 'PUT' && id) {
        return updateEpisode(id, data);
      }
      if (method === 'DELETE' && id) {
        deleteEpisode(id);
        return null;
      }
      break;
    }

    case 'scenes': {
      if (method === 'GET') {
        return getStoredScenes();
      }
      if (method === 'POST') {
        const res = createScene(data);
        return res?.scene || res;
      }
      if (method === 'PUT' && id) {
        return updateScene(id, data);
      }
      if (method === 'DELETE' && id) {
        deleteScene(id);
        return null;
      }
      break;
    }

    default:
      console.warn(`Unmapped resource for local storage fallback: ${resource}`);
      return [];
  }

  return [];
}

export async function api(path, method = 'GET', data) {
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(BASE + cleanPath, {
      method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      ...(data === undefined
        ? {}
        : {
            body: JSON.stringify(data),
          }),
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      if (res.status === 204) return null;
      const json = await res.json();
      
      return json;
    }

    console.warn(`Backend returned HTTP ${res.status} for ${cleanPath}, falling back to local storage.`);
    return handleLocalStorageFallback(cleanPath, method, data);
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`Backend unreachable for ${cleanPath} (${err.message}), falling back to local storage.`);
    return handleLocalStorageFallback(cleanPath, method, data);
  }
}

export const list = (resource) => api('/' + resource);

export const create = (resource, data) =>
  api('/' + resource, 'POST', data);

export const update = (resource, id, data) =>
  api('/' + resource + '/' + encodeURIComponent(id), 'PUT', data);

export const remove = (resource, id) =>
  api('/' + resource + '/' + encodeURIComponent(id), 'DELETE');

export const formatCurrency = (value) =>
  '₹' + Number(value || 0).toLocaleString('en-IN');
