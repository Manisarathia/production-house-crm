import { useCallback, useEffect, useState } from 'react';
import { getId } from '../utils/helpers';

export default function useResource(api, fallbackItems = [], customKey = '') {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [error, setError] = useState('');

  const resourceKey = customKey || api?.path || 'default';
  const storageKey = `crm_mock_${resourceKey.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  const getFallbackList = useCallback(() => {
    const raw = typeof fallbackItems === 'function' ? fallbackItems() : fallbackItems;
    return Array.isArray(raw) ? raw : [];
  }, [fallbackItems]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.list();

      if (Array.isArray(data)) {
        setItems(data);
        setIsBackendConnected(true);
        setError('');
        try {
          localStorage.setItem(storageKey, JSON.stringify(data));
        } catch {
          // ignore
        }
      } else if (data && typeof data === 'object') {
        const foundArray = Object.values(data).find(Array.isArray);
        if (foundArray) {
          setItems(foundArray);
          setIsBackendConnected(true);
          setError('');
          try {
            localStorage.setItem(storageKey, JSON.stringify(foundArray));
          } catch {
            // ignore
          }
        } else {
          throw new Error('Backend returned non-array payload');
        }
      } else {
        throw new Error('Backend returned invalid response');
      }
    } catch {
      // Backend is offline or not reachable -> Show dummy data
      setIsBackendConnected(false);

      let initialData = null;
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialData = parsed;
          }
        }
      } catch {
        initialData = null;
      }

      if (!initialData) {
        initialData = getFallbackList();
        try {
          localStorage.setItem(storageKey, JSON.stringify(initialData));
        } catch {
          // ignore
        }
      }

      setItems(initialData);
      setError('');
    } finally {
      setLoading(false);
    }
  }, [api, getFallbackList, storageKey]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (values, id) => {
    if (isBackendConnected) {
      try {
        if (id) {
          await api.update(id, values);
        } else {
          await api.create(values);
        }
        await load();
        return;
      } catch (err) {
        console.warn('Backend save failed, falling back to local state:', err);
      }
    }

    // Local state update when backend is offline
    setItems((prevItems) => {
      const targetId = id || getId(values);
      let updated;
      if (targetId && prevItems.some((item) => getId(item) === targetId)) {
        updated = prevItems.map((item) =>
          getId(item) === targetId ? { ...item, ...values, id: targetId, _id: targetId } : item
        );
      } else {
        const newRecord = {
          ...values,
          id: targetId || `demo-${Date.now()}`,
          _id: targetId || `demo-${Date.now()}`,
        };
        updated = [newRecord, ...prevItems];
      }

      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const remove = async (id) => {
    if (isBackendConnected) {
      try {
        await api.remove(id);
        await load();
        return;
      } catch (err) {
        console.warn('Backend remove failed, falling back to local state:', err);
      }
    }

    // Local state delete when backend is offline
    setItems((prevItems) => {
      const updated = prevItems.filter((item) => getId(item) !== id);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  return {
    items,
    loading,
    error,
    isBackendConnected,
    reload: load,
    save,
    remove,
  };
}
