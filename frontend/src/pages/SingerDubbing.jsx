import { useState, useMemo, useEffect } from 'react';
import {
  Mic,
  Headphones,
  Languages,
  Clock,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  X,
  LayoutGrid,
  List,
  Table as TableIcon,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  AlertCircle,
  Radio,
  Volume2,
  Calendar,
  Sparkles,
  Music,
  Disc3,
  FileAudio,
  RefreshCw,
  Loader2
} from 'lucide-react';
import {
  singerApi,
  dubbingApi,
  extractPageItems,
  normalizeSingerStatusToBackend,
  normalizeSingerStatusToFrontend,
  normalizeDubbingStatusToBackend,
  normalizeDubbingStatusToFrontend
} from '../api/mediaAudioLegalApi.js';
import {
  getStoredProjects,
  formatCurrency,
  getStoredSingers,
  saveSingers,
  createSinger,
  updateSinger,
  deleteSinger,
  getStoredDubbing,
  saveDubbing,
  createDubbing,
  updateDubbing,
  deleteDubbing,
  getSingerImage,
  getDubbingImage
} from '../utils/productionStorage.js';

export default function SingerDubbing() {
  const [projects] = useState(() => getStoredProjects());
  const [activeTab, setActiveTab] = useState('singers'); // 'singers' | 'dubbing'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'table'

  // Data states
  const [singers, setSingers] = useState([]);
  const [dubbingSessions, setDubbingSessions] = useState([]);

  // Live API States
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBackendData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [singersRes, dubbingRes] = await Promise.all([
        singerApi.list({ size: 100 }),
        dubbingApi.list({ size: 100 })
      ]);

      const items = extractPageItems(singersRes);
      const mapped = items.map(item => ({
        id: item.id,
        songTitle: item.biography || (item.name ? item.name + ' - Theme Track' : 'Original Soundtrack'),
        singerName: item.name || 'Lead Vocalist',
        vocalType: item.voiceType || 'Lead Vocalist (Playback)',
        language: item.languages || 'Hindi',
        project: item.voiceRange || 'The Last Monsoon',
        musicDirector: item.musicDirector || 'Pritam Chakraborty',
        lyricist: item.lyricist || 'Amitabh Bhattacharya',
        duration: item.duration || '4 mins 20 secs',
        recordingStudio: item.recordingStudio || 'YRF Studios (Studio A), Mumbai',
        recordingStatus: normalizeSingerStatusToFrontend(item.status) === 'Active' ? 'Mastered & Mixed' : 'In Studio',
        fee: item.fee || 1500000,
        platform: item.platform || 'LoopNexus',
        image: item.image || getSingerImage(item.id)
      }));
      setSingers(mapped);

      const dubbingItems = extractPageItems(dubbingRes);
      const mappedDubbing = dubbingItems.map(item => ({
        id: item.id,
        characterName: item.name || 'Lead Character',
        project: item.projectRef || 'The Last Monsoon',
        targetLanguage: item.language || 'Tamil',
        voiceArtist: item.singerName || 'Voice Artist',
        dubbingDirector: item.dubbingDirector || 'Sound Lab Director',
        studioFacility: item.studio || 'Sound & Vision India, Andheri',
        sessionDate: item.scheduledAt ? item.scheduledAt.slice(0, 10) : new Date().toISOString().split('T')[0],
        sessionTime: item.sessionTime || '10:00 AM - 02:00 PM',
        reelsOrEpisodes: item.notes || 'Episodes 1 to 4',
        status: normalizeDubbingStatusToFrontend(item.status),
        lipsyncQuality: item.lipsyncQuality || 'Passed Sync Check',
        platform: item.platform || 'LoopNexus',
        image: item.image || getDubbingImage(item.id)
      }));
      setDubbingSessions(mappedDubbing);
    } catch (err) {
      console.warn('Backend fetch error in SingerDubbing:', err);
      setApiError(err.message || 'Could not connect to live backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedBackend = async () => {
    setIsSubmitting(true);
    try {
      showToast('Seeding initial singers to Spring Boot backend database...', 'info');
      const sampleSingers = [
        { name: 'Arijit Singh', email: 'arijit@loopstream.media', phone: '+91 98200 11223', languages: 'Hindi, Bengali', voiceType: 'Lead Vocalist (Playback)', voiceRange: 'The Last Monsoon', biography: 'Rains of Sahyadri (Main Theme)', status: 'ACTIVE', active: true },
        { name: 'Shreya Ghoshal', email: 'shreya@loopstream.media', phone: '+91 98200 44556', languages: 'Hindi, Tamil, Telugu', voiceType: 'Female Lead Playback', voiceRange: 'City of Echoes', biography: 'Echoes in the Dark', status: 'ACTIVE', active: true }
      ];
      for (const s of sampleSingers) {
        await singerApi.create(s).catch(() => {});
      }
      await fetchBackendData();
      showToast('Singers seeded into backend database successfully!');
    } catch (e) {
      showToast('Failed to seed singers: ' + e.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL'); // 'ALL' | 'LoopNexus' | 'LoopKids'
  const [languageFilter, setLanguageFilter] = useState('ALL');
  const [playingTrackId, setPlayingTrackId] = useState(null);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form states
  const initialSingerForm = {
    songTitle: '',
    project: projects[0]?.name || 'The Last Monsoon',
    singerName: '',
    vocalType: 'Lead Vocalist (Male)',
    language: 'Hindi',
    musicDirector: '',
    lyricist: '',
    duration: '4 mins 15 secs',
    recordingStudio: 'YRF Studios (Studio A), Mumbai',
    recordingStatus: 'Mastered & Mixed',
    fee: 1500000,
    isrcCode: '',
    releaseDate: new Date().toISOString().split('T')[0],
    platform: 'LoopNexus',
    image: ''
  };

  const initialDubbingForm = {
    project: projects[0]?.name || 'The Last Monsoon',
    characterName: '',
    targetLanguage: 'Tamil',
    voiceArtist: '',
    dubbingDirector: '',
    studioFacility: 'Sound & Vision India, Andheri',
    sessionDate: new Date().toISOString().split('T')[0],
    sessionTime: '10:00 AM - 02:00 PM',
    reelsOrEpisodes: 'Episodes 1 to 4',
    timecode: '00:00:00:00 - 02:30:00:00',
    status: 'Scheduled',
    lipsyncQuality: 'Pending Session',
    platform: 'LoopNexus',
    image: ''
  };

  const [singerFormData, setSingerFormData] = useState(initialSingerForm);
  const [dubbingFormData, setDubbingFormData] = useState(initialDubbingForm);

  // Tone mapping helper
  const getStatusTone = (status) => {
    switch (status) {
      case 'Mastered & Mixed':
      case 'Completed':
        return 'green';
      case 'In Studio':
      case 'In Progress':
        return 'orange';
      case 'Scheduled':
      case 'Recorded':
        return 'blue';
      default:
        return 'blue';
    }
  };

  // KPI Metrics
  const totalSingersCount = singers.length;
  const totalDubbingCount = dubbingSessions.length;
  const completedDubbingCount = dubbingSessions.filter(d => d.status === 'Completed').length;
  const totalMusicSpend = useMemo(() => {
    return singers.reduce((acc, s) => acc + (Number(s.fee) || 0), 0);
  }, [singers]);

  // Filtered Singers
  const filteredSingers = useMemo(() => {
    return singers.filter(item => {
      if (platformFilter !== 'ALL' && item.platform.toLowerCase() !== platformFilter.toLowerCase()) {
        return false;
      }
      if (languageFilter !== 'ALL' && !item.language.toLowerCase().includes(languageFilter.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSong = item.songTitle?.toLowerCase().includes(q);
        const matchSinger = item.singerName?.toLowerCase().includes(q);
        const matchProj = item.project?.toLowerCase().includes(q);
        const matchDirector = item.musicDirector?.toLowerCase().includes(q);
        const matchStudio = item.recordingStudio?.toLowerCase().includes(q);
        const matchId = item.id?.toLowerCase().includes(q);
        return matchSong || matchSinger || matchProj || matchDirector || matchStudio || matchId;
      }
      return true;
    });
  }, [singers, platformFilter, languageFilter, searchQuery]);

  // Filtered Dubbing Sessions
  const filteredDubbing = useMemo(() => {
    return dubbingSessions.filter(item => {
      if (platformFilter !== 'ALL' && item.platform.toLowerCase() !== platformFilter.toLowerCase()) {
        return false;
      }
      if (languageFilter !== 'ALL' && !item.targetLanguage.toLowerCase().includes(languageFilter.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchChar = item.characterName?.toLowerCase().includes(q);
        const matchArtist = item.voiceArtist?.toLowerCase().includes(q);
        const matchLang = item.targetLanguage?.toLowerCase().includes(q);
        const matchProj = item.project?.toLowerCase().includes(q);
        const matchStudio = item.studioFacility?.toLowerCase().includes(q);
        const matchId = item.id?.toLowerCase().includes(q);
        return matchChar || matchArtist || matchLang || matchProj || matchStudio || matchId;
      }
      return true;
    });
  }, [dubbingSessions, platformFilter, languageFilter, searchQuery]);

  // Open Create
  const handleOpenCreate = () => {
    if (activeTab === 'singers') {
      setSingerFormData({
        ...initialSingerForm,
        project: projects[0]?.name || 'The Last Monsoon',
        releaseDate: new Date().toISOString().split('T')[0]
      });
    } else {
      setDubbingFormData({
        ...initialDubbingForm,
        project: projects[0]?.name || 'The Last Monsoon',
        sessionDate: new Date().toISOString().split('T')[0]
      });
    }
    setCreateModalOpen(true);
  };

  // Submit Create
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeTab === 'singers') {
        if (!singerFormData.songTitle.trim()) return;
        const payload = {
          name: singerFormData.singerName.trim() || singerFormData.songTitle.trim(),
          email: ((singerFormData.singerName || 'singer').toLowerCase().replace(/[^a-z0-9]/g, '') + '@loopstream.media'),
          phone: '+91 98200 12345',
          languages: singerFormData.language || 'Hindi',
          voiceType: singerFormData.vocalType || 'Lead Vocalist',
          voiceRange: singerFormData.project || 'The Last Monsoon',
          biography: singerFormData.songTitle || 'Original Soundtrack',
          status: 'ACTIVE',
          active: true
        };

        try {
          const created = await singerApi.create(payload);
          const mappedNew = {
            ...singerFormData,
            id: created.id,
            singerName: created.name || singerFormData.singerName,
            image: getSingerImage(created.id)
          };
          setSingers(prev => [mappedNew, ...prev]);
          showToast('Singer profile and track registered on backend successfully!');
        } catch (apiErr) {
          console.warn('Backend create failed, storing locally:', apiErr);
          const { all } = createSinger(singerFormData);
          setSingers(all);
          showToast('Track saved locally.', 'info');
        }
      } else {
        if (!dubbingFormData.characterName.trim()) return;
        const scheduledAt = (dubbingFormData.sessionDate || new Date().toISOString().split('T')[0]) + 'T10:00:00';
        const endsAt = (dubbingFormData.sessionDate || new Date().toISOString().split('T')[0]) + 'T14:00:00';
        const singerRefId = typeof singers[0]?.id === 'number' ? singers[0].id : 1;

        const payload = {
          name: dubbingFormData.characterName.trim(),
          projectRef: dubbingFormData.project,
          singerId: singerRefId,
          mediaId: null,
          scheduledAt: scheduledAt,
          endsAt: endsAt,
          studio: dubbingFormData.studioFacility || 'Sound & Vision India, Andheri',
          language: dubbingFormData.targetLanguage || 'Tamil',
          status: normalizeDubbingStatusToBackend(dubbingFormData.status),
          notes: dubbingFormData.reelsOrEpisodes || '',
          active: true
        };

        try {
          const created = await dubbingApi.create(payload);
          const mappedNew = {
            ...dubbingFormData,
            id: created.id,
            characterName: created.name || dubbingFormData.characterName,
            image: getDubbingImage(created.id)
          };
          setDubbingSessions(prev => [mappedNew, ...prev]);
          showToast('Dubbing session scheduled on backend successfully!');
        } catch (apiErr) {
          console.warn('Backend create failed, storing locally:', apiErr);
          const { all } = createDubbing(dubbingFormData);
          setDubbingSessions(all);
          showToast('Session saved locally.', 'info');
        }
      }
      setCreateModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit
  const handleOpenEdit = (item) => {
    setEditItem(item);
    if (activeTab === 'singers') {
      setSingerFormData({
        songTitle: item.songTitle,
        project: item.project,
        singerName: item.singerName,
        vocalType: item.vocalType,
        language: item.language,
        musicDirector: item.musicDirector,
        lyricist: item.lyricist,
        duration: item.duration,
        recordingStudio: item.recordingStudio,
        recordingStatus: item.recordingStatus,
        fee: item.fee,
        isrcCode: item.isrcCode || '',
        releaseDate: item.releaseDate || '',
        platform: item.platform,
        image: item.image || ''
      });
    } else {
      setDubbingFormData({
        project: item.project,
        characterName: item.characterName,
        targetLanguage: item.targetLanguage,
        voiceArtist: item.voiceArtist,
        dubbingDirector: item.dubbingDirector,
        studioFacility: item.studioFacility,
        sessionDate: item.sessionDate,
        sessionTime: item.sessionTime,
        reelsOrEpisodes: item.reelsOrEpisodes,
        timecode: item.timecode,
        status: item.status,
        lipsyncQuality: item.lipsyncQuality,
        platform: item.platform,
        image: item.image || ''
      });
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    setIsSubmitting(true);
    try {
      const isNumericId = typeof editItem.id === 'number' || /^\d+$/.test(editItem.id);

      if (activeTab === 'singers') {
        const payload = {
          name: singerFormData.singerName.trim() || singerFormData.songTitle.trim(),
          email: ((singerFormData.singerName || 'singer').toLowerCase().replace(/[^a-z0-9]/g, '') + '@loopstream.media'),
          phone: '+91 98200 12345',
          languages: singerFormData.language || 'Hindi',
          voiceType: singerFormData.vocalType || 'Lead Vocalist',
          voiceRange: singerFormData.project || 'The Last Monsoon',
          biography: singerFormData.songTitle || 'Original Soundtrack',
          status: 'ACTIVE',
          active: true
        };

        if (isNumericId) {
          try {
            await singerApi.update(editItem.id, payload);
            setSingers(prev => prev.map(s => (s.id === editItem.id ? { ...s, ...singerFormData } : s)));
            showToast('Singer record updated successfully on backend!');
          } catch (apiErr) {
            console.warn('Backend update failed, updating locally:', apiErr);
            const updated = updateSinger(editItem.id, singerFormData);
            setSingers(updated);
            showToast('Record updated locally.', 'info');
          }
        } else {
          const updated = updateSinger(editItem.id, singerFormData);
          setSingers(updated);
          showToast('Record updated locally.');
        }
      } else {
        const scheduledAt = (dubbingFormData.sessionDate || new Date().toISOString().split('T')[0]) + 'T10:00:00';
        const endsAt = (dubbingFormData.sessionDate || new Date().toISOString().split('T')[0]) + 'T14:00:00';
        const singerRefId = typeof singers[0]?.id === 'number' ? singers[0].id : 1;

        const payload = {
          name: dubbingFormData.characterName.trim(),
          projectRef: dubbingFormData.project,
          singerId: singerRefId,
          mediaId: null,
          scheduledAt: scheduledAt,
          endsAt: endsAt,
          studio: dubbingFormData.studioFacility || 'Sound & Vision India, Andheri',
          language: dubbingFormData.targetLanguage || 'Tamil',
          status: normalizeDubbingStatusToBackend(dubbingFormData.status),
          notes: dubbingFormData.reelsOrEpisodes || '',
          active: true
        };

        if (isNumericId) {
          try {
            await dubbingApi.update(editItem.id, payload);
            setDubbingSessions(prev => prev.map(d => (d.id === editItem.id ? { ...d, ...dubbingFormData } : d)));
            showToast('Dubbing session updated successfully on backend!');
          } catch (apiErr) {
            console.warn('Backend update failed, updating locally:', apiErr);
            const updated = updateDubbing(editItem.id, dubbingFormData);
            setDubbingSessions(updated);
            showToast('Session updated locally.', 'info');
          }
        } else {
          const updated = updateDubbing(editItem.id, dubbingFormData);
          setDubbingSessions(updated);
          showToast('Session updated locally.');
        }
      }
      setEditItem(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const isNumericId = typeof deleteTarget.id === 'number' || /^\d+$/.test(deleteTarget.id);

      if (activeTab === 'singers') {
        if (isNumericId) {
          try {
            await singerApi.delete(deleteTarget.id);
            setSingers(prev => prev.filter(s => s.id !== deleteTarget.id));
            showToast('Singer track deleted from backend.');
          } catch (apiErr) {
            console.warn('Backend delete failed, removing locally:', apiErr);
            const updated = deleteSinger(deleteTarget.id);
            setSingers(updated);
            showToast('Track removed locally.', 'info');
          }
        } else {
          const updated = deleteSinger(deleteTarget.id);
          setSingers(updated);
          showToast('Track deleted successfully.');
        }
      } else {
        if (isNumericId) {
          try {
            await dubbingApi.delete(deleteTarget.id);
            setDubbingSessions(prev => prev.filter(d => d.id !== deleteTarget.id));
            showToast('Dubbing session deleted from backend.');
          } catch (apiErr) {
            console.warn('Backend delete failed, removing locally:', apiErr);
            const updated = deleteDubbing(deleteTarget.id);
            setDubbingSessions(updated);
            showToast('Session removed locally.', 'info');
          }
        } else {
          const updated = deleteDubbing(deleteTarget.id);
          setDubbingSessions(updated);
          showToast('Session deleted successfully.');
        }
      }

      if (detailItem && detailItem.id === deleteTarget.id) {
        setDetailItem(null);
      }
      setDeleteTarget(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Exact Visual & Hover Styling matching Projects & Productions */}
      <style>{`
        html { scroll-behavior: smooth !important; }
        * { scroll-behavior: smooth; }
        .main-area, .page-content, .table-wrap, .modal-card, .filter-tabs {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        ::-webkit-scrollbar { width: 7px; height: 7px; }
        ::-webkit-scrollbar-track { background: #141414; }
        ::-webkit-scrollbar-thumb { background: #2f2f2f; border-radius: 6px; }
        ::-webkit-scrollbar-thumb:hover { background: #e3652e; }

        .prod-card, .prod-list-card {
          transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.24s ease, 
                      box-shadow 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .prod-card {
          overflow: hidden;
          padding-top: 0 !important;
        }
        .prod-card-poster-wrap {
          position: relative;
          width: calc(100% + 36px);
          margin: 0 -18px 14px -18px;
          height: 156px;
          overflow: hidden;
          background: #111;
        }
        .prod-card-poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 35%;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), filter 0.45s ease;
          filter: brightness(0.85) contrast(1.08);
          display: block;
        }
        .prod-card:hover .prod-card-poster-img {
          transform: scale(1.08);
          filter: brightness(1.02) contrast(1.15);
        }
        .prod-card-poster-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(25,25,25,0.15) 45%, #191919 100%);
          pointer-events: none;
        }
        .prod-card-poster-badges {
          position: absolute;
          top: 12px;
          left: 14px;
          right: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 2;
        }

        .list-poster-thumb {
          position: relative;
          width: 52px;
          height: 68px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.28s ease, box-shadow 0.28s ease;
        }
        .list-poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: brightness(0.9) contrast(1.05);
          transition: transform 0.35s ease, filter 0.35s ease;
        }
        .list-poster-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          color: #f07842;
        }
        .prod-list-card:hover .list-poster-thumb {
          transform: scale(1.06);
          border-color: rgba(227, 101, 46, 0.6);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.6), 0 0 14px rgba(227, 101, 46, 0.25);
        }
        .prod-list-card:hover .list-poster-img {
          transform: scale(1.1);
          filter: brightness(1.05) contrast(1.12);
        }
        .prod-list-card:hover .list-poster-overlay { opacity: 1; }

        .table-poster-thumb {
          width: 36px;
          height: 48px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
        }
        .table-poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: brightness(0.9) contrast(1.05);
          transition: transform 0.3s ease, filter 0.3s ease;
        }
        .table-wrap tr:hover .table-poster-thumb {
          transform: scale(1.12);
          border-color: #e3652e;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 10px rgba(227, 101, 46, 0.3);
        }
        .table-wrap tr:hover .table-poster-img {
          transform: scale(1.1);
          filter: brightness(1.05) contrast(1.15);
        }
        .prod-card:hover {
          transform: translateY(-5px);
          border-color: #e3652e !important;
          box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.65), 
                      0 0 0 1px rgba(227, 101, 46, 0.35), 
                      0 0 25px rgba(227, 101, 46, 0.12) !important;
        }
        .prod-list-card:hover {
          transform: translateY(-3px) translateX(2px);
          border-color: #e3652e !important;
          box-shadow: 0 14px 30px -6px rgba(0, 0, 0, 0.65), 
                      0 0 0 1px rgba(227, 101, 46, 0.35), 
                      0 0 20px rgba(227, 101, 46, 0.1) !important;
        }
        .prod-card:hover .project-icon, .prod-list-card:hover .project-icon {
          transform: scale(1.1) rotate(2deg);
          box-shadow: 0 4px 14px rgba(227, 101, 46, 0.35);
        }
        .prod-card .project-icon, .prod-list-card .project-icon {
          transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.24s ease;
        }
        .prod-card:hover .prod-card-title-group h3 {
          color: #ffffff;
          transition: color 0.18s ease;
        }
        .prod-card:hover .prod-synopsis {
          color: #c4bcb4;
          transition: color 0.18s ease;
        }

        .prod-card-actions .icon-button,
        .table-wrap .icon-button {
          transition: transform 0.18s ease, background-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
          border-radius: 7px;
        }
        .prod-card-actions .icon-button:hover,
        .table-wrap .icon-button:hover {
          transform: scale(1.15);
        }
        .prod-card-actions .icon-button[title*="View"]:hover,
        .table-wrap .icon-button[title*="View"]:hover,
        .table-wrap .icon-button[title*="Inspect"]:hover {
          color: #70d5e2 !important;
          background: rgba(112, 213, 226, 0.16) !important;
          box-shadow: 0 0 12px rgba(112, 213, 226, 0.25);
        }
        .prod-card-actions .icon-button[title*="Edit"]:hover,
        .table-wrap .icon-button[title*="Edit"]:hover {
          color: #f07842 !important;
          background: rgba(227, 101, 46, 0.18) !important;
          box-shadow: 0 0 12px rgba(227, 101, 46, 0.28);
        }
        .prod-card-actions .icon-button[title*="Delete"]:hover,
        .table-wrap .icon-button[title*="Delete"]:hover {
          color: #ff6b6b !important;
          background: rgba(220, 60, 60, 0.2) !important;
          box-shadow: 0 0 12px rgba(220, 60, 60, 0.35);
        }

        .mini-stat {
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.22s ease, 
                      box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mini-stat:hover {
          transform: translateY(-3px);
          border-color: rgba(227, 101, 46, 0.5) !important;
          box-shadow: 0 10px 24px -4px rgba(0, 0, 0, 0.5), 
                      0 0 16px rgba(227, 101, 46, 0.12) !important;
        }

        .filter-tab-pill {
          transition: transform 0.18s ease, border-color 0.18s ease, color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
        }
        .filter-tab-pill:hover {
          transform: translateY(-2px);
          border-color: #e3652e !important;
          color: #ffffff !important;
          background: rgba(227, 101, 46, 0.12) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
        }

        .table-wrap tbody tr {
          transition: background-color 0.2s ease, box-shadow 0.2s ease;
        }
        .table-wrap tbody tr:hover td {
          background: #231c18 !important;
        }
        .table-wrap tbody tr:hover td:first-child {
          box-shadow: inset 3px 0 0 #e3652e;
        }

        .table-search {
          border: 1px solid #303030 !important;
          outline: none !important;
          box-shadow: none !important;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .table-search:hover { border-color: rgba(227, 101, 46, 0.5) !important; }
        .table-search:focus-within {
          border-color: #e3652e !important;
          box-shadow: 0 0 0 2px rgba(227, 101, 46, 0.25) !important;
          outline: none !important;
        }
        .table-search input,
        .table-search input:focus,
        .table-search input:focus-visible,
        .table-search input:active {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          -webkit-appearance: none !important;
        }

        /* Typography sizing matching Projects & Productions */
        .page-heading h1 { font-size: 29px !important; }
        .page-heading p { font-size: 13.5px !important; }
        .eyebrow { font-size: 10.5px !important; letter-spacing: 1.4px !important; }
        .mini-stat span { font-size: 11.5px !important; color: #a7a09a; }
        .mini-stat strong { font-size: 24px !important; color: #f4f0eb; }
        .panel-head h2 { font-size: 16px !important; }
        .panel-head p { font-size: 12px !important; }
        .segmented button { font-size: 11px !important; padding: 7px 11px !important; }
        .table-search { font-size: 12px !important; height: 36px !important; }
        .table-search input { font-size: 12px !important; }
        .filter-tab-pill { font-size: 11px !important; padding: 7px 13px !important; }
        .badge-tag { font-size: 10px !important; padding: 4.5px 8px !important; }
        .status-pill { font-size: 10px !important; padding: 5px 9px !important; }
        .btn { font-size: 12.5px !important; padding: 10px 16px !important; }
        .table-wrap thead th { font-size: 10.5px !important; letter-spacing: 0.7px !important; padding: 13px 11px !important; }
        .table-wrap tbody td { font-size: 12px !important; padding: 14px 11px !important; }
        .prod-card-title-group h3 { font-size: 15.5px !important; }
        .prod-card-title-group span { font-size: 11px !important; }
        .prod-synopsis { font-size: 12px !important; line-height: 1.65 !important; }
        .prod-progress-head { font-size: 11.5px !important; }
        .prod-progress-head strong { font-size: 12.5px !important; }
        .prod-finance-item span { font-size: 10.5px !important; }
        .prod-finance-item strong { font-size: 13.5px !important; }
        .prod-foot-crew span { font-size: 10.5px !important; }
        .prod-foot-crew strong { font-size: 12px !important; }
        .modal-card h2 { font-size: 18px !important; }
        .modal-card label, .form-grid label { font-size: 11.5px !important; }
        .modal-card input, .modal-card select, .modal-card textarea { font-size: 12.5px !important; }
        .detail-section h4 { font-size: 12.5px !important; }
        .detail-item span { font-size: 10.5px !important; }
        .detail-item strong { font-size: 13px !important; }
      `}</style>

      {/* Top Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> MEDIA, AUDIO & LEGAL MANAGEMENT
          </div>
          <h1>Singer Details & Dubbing Schedules</h1>
          <p>
            Manage original soundtrack recording contracts, playback singers, dubbing rosters, and localization timecodes.
          </p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} /> {activeTab === 'singers' ? 'Add Singer Track' : 'Schedule Dubbing Session'}
          </button>
        </div>
      </div>

      {/* Mini Stats KPI */}
      <div className="mini-stats">
        <div className="mini-stat">
          <span>Soundtrack Tracks</span>
          <strong>{totalSingersCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Dubbing Sessions</span>
          <strong style={{ color: '#f07842' }}>{totalDubbingCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Completed Dubs</span>
          <strong style={{ color: '#67d7a3' }}>{completedDubbingCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Vocalist Budget</span>
          <strong>{formatCurrency(totalMusicSpend)}</strong>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '28px',
          zIndex: 9999,
          background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : toast.type === 'info' ? 'rgba(59, 130, 246, 0.95)' : 'rgba(34, 197, 94, 0.95)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          fontWeight: 600,
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '8px' }}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* Sync Status / Refresh Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '14px', gap: '10px' }}>
        <button
          onClick={fetchBackendData}
          disabled={loading}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid #2e2e2e',
            borderRadius: '8px',
            color: '#a7a09a',
            padding: '6px 12px',
            fontSize: '11px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Refresh from Spring Boot API"
        >
          <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Syncing Spring Boot...' : 'Refresh Live Data'}
        </button>
      </div>

      {/* Main Panel */}
      <div className="panel page-panel">
        <div className="panel-head" style={{ flexWrap: 'wrap', gap: '14px' }}>
          {/* Sub-Module Switcher Tabs */}
          <div className="segmented" style={{ background: '#242424', padding: '4px', borderRadius: '10px' }}>
            <button
              type="button"
              className={activeTab === 'singers' ? 'chosen' : ''}
              onClick={() => setActiveTab('singers')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 15px', fontSize: '12px' }}
            >
              <Mic size={16} /> Singer Details & Soundtracks
            </button>
            <button
              type="button"
              className={activeTab === 'dubbing' ? 'chosen' : ''}
              onClick={() => setActiveTab('dubbing')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 15px', fontSize: '12px' }}
            >
              <Languages size={16} /> Dubbing Schedules & Voice
            </button>
          </div>

          <div className="inline-actions" style={{ flexWrap: 'wrap', gap: '12px' }}>
            {/* View Mode Toggle */}
            <div className="segmented">
              <button
                type="button"
                className={viewMode === 'grid' ? 'chosen' : ''}
                onClick={() => setViewMode('grid')}
                title="Grid Cards View"
              >
                <LayoutGrid size={15} /> Grid
              </button>
              <button
                type="button"
                className={viewMode === 'list' ? 'chosen' : ''}
                onClick={() => setViewMode('list')}
                title="List Grid View"
              >
                <List size={15} /> List
              </button>
              <button
                type="button"
                className={viewMode === 'table' ? 'chosen' : ''}
                onClick={() => setViewMode('table')}
                title="Tabular View"
              >
                <TableIcon size={15} /> Table
              </button>
            </div>

            {/* Search Input without blue outline */}
            <label className="table-search" style={{ minWidth: '220px' }}>
              <Search size={16} />
              <input
                placeholder={activeTab === 'singers' ? 'Search songs, vocalists, composers...' : 'Search voice artists, characters, langs...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              />
            </label>
          </div>
        </div>

        {/* Filter Tabs Bar */}
        <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Platform Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8a96a8', letterSpacing: '1px' }}>
              PLATFORM:
            </span>
            <div className="filter-tabs">
              {['ALL', 'LoopNexus', 'LoopKids'].map(plat => {
                const isPlatKids = plat === 'LoopKids';
                const isActive = platformFilter.toLowerCase() === plat.toLowerCase();
                return (
                  <button
                    key={plat}
                    type="button"
                    className={`filter-tab-pill ${isActive ? 'active' : ''}`}
                    onClick={() => setPlatformFilter(plat)}
                    style={isPlatKids && isActive ? { background: 'rgba(234, 179, 8, 0.22)', color: '#facc15', borderColor: '#eab308' } : undefined}
                  >
                    {plat === 'ALL' ? 'All Platforms' : plat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8a96a8', letterSpacing: '1px' }}>
              LANGUAGE:
            </span>
            <div className="filter-tabs">
              {['ALL', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'English', 'Marathi'].map(lang => (
                <button
                  key={lang}
                  type="button"
                  className={`filter-tab-pill ${languageFilter.toLowerCase() === lang.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setLanguageFilter(lang)}
                >
                  {lang === 'ALL' ? 'All Languages' : lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= CARD GRID VIEW ================= */}
        {viewMode === 'grid' && (
          <div className="production-grid">
            {activeTab === 'singers' ? (
              filteredSingers.map(s => {
                const tone = getStatusTone(s.recordingStatus);
                const isKids = s.platform === 'LoopKids';
                const singerImg = getSingerImage(s);
                const isPlaying = playingTrackId === s.id;

                return (
                  <div className="prod-card" key={s.id}>
                    {/* Top Contextual Visual Banner (Vocalist at studio mic, pop filter, acoustic studio) */}
                    <div className="prod-card-poster-wrap">
                      <img
                        src={singerImg}
                        alt={s.singerName}
                        className="prod-card-poster-img"
                        loading="lazy"
                      />
                      <div className="prod-card-poster-gradient" />
                      <div className="prod-card-poster-badges">
                        <span
                          className="badge-tag platform"
                          style={{
                            background: isKids ? 'rgba(234, 179, 8, 0.25)' : 'rgba(42, 28, 22, 0.9)',
                            backdropFilter: 'blur(8px)',
                            border: isKids ? '1px solid #eab308' : '1px solid #4a2b1b',
                            color: isKids ? '#facc15' : '#f07842',
                            fontWeight: 700
                          }}
                        >
                          {s.platform}
                        </span>
                        <span className={`status-pill ${tone}`} style={{ backdropFilter: 'blur(8px)', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                          {s.recordingStatus}
                        </span>
                      </div>
                    </div>

                    {/* Card Top */}
                    <div className="prod-card-top">
                      <div className="prod-card-title-group">
                        <div
                          className={`project-icon ${tone}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setPlayingTrackId(isPlaying ? null : s.id)}
                          title={isPlaying ? 'Pause Preview' : 'Play Sound Preview'}
                        >
                          {isPlaying ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
                        </div>
                        <div>
                          <h3>{s.songTitle}</h3>
                          <span>{s.id} · {s.singerName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Tags */}
                    <div className="prod-meta-tags">
                      <span className="badge-tag">{s.vocalType}</span>
                      <span className="badge-tag format">{s.language}</span>
                      <span className="badge-tag">{s.duration}</span>
                    </div>

                    {/* Audio Waveform Preview */}
                    <div style={{ background: '#141414', borderRadius: '8px', padding: '10px 12px', border: '1px solid #262626' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10.5px', color: '#888' }}>
                          {isPlaying ? 'Simulated Audio Playing...' : 'Studio Master Track'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#f07842', fontWeight: 700 }}>
                          {s.isrcCode}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '24px' }}>
                        {[35, 65, 45, 85, 95, 60, 40, 75, 90, 50, 70, 85, 40, 60, 80, 55, 90, 70, 45, 65, 50, 75, 40, 60].map((h, i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: `${h}%`,
                              borderRadius: '2px',
                              background: isPlaying ? '#f07842' : '#3d3d3d',
                              transition: 'height 0.2s ease, background-color 0.2s ease'
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Composer & Fee Overview */}
                    <div className="prod-finance-row">
                      <div className="prod-finance-item">
                        <span>Music Director</span>
                        <strong>{s.musicDirector}</strong>
                      </div>
                      <div className="prod-finance-item">
                        <span>Artist Compensation</span>
                        <strong style={{ color: '#10b981' }}>{formatCurrency(s.fee)}</strong>
                      </div>
                    </div>

                    {/* Card Foot */}
                    <div className="prod-card-foot">
                      <div className="prod-foot-crew">
                        <div className="avatar avatar-blue" style={{ width: '28px', height: '28px', fontSize: '9px' }}>
                          <Headphones size={14} />
                        </div>
                        <div>
                          <span>Studio Facility</span>
                          <strong style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.recordingStudio}
                          </strong>
                        </div>
                      </div>

                      <div className="prod-card-actions">
                        <button className="icon-button" onClick={() => setDetailItem(s)} title="Inspect Track Details">
                          <Eye size={16} />
                        </button>
                        <button className="icon-button" onClick={() => handleOpenEdit(s)} title="Edit Track">
                          <Edit3 size={16} />
                        </button>
                        <button className="icon-button" onClick={() => setDeleteTarget(s)} title="Delete Track" style={{ color: '#dc6464' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* DUBBING SESSIONS GRID */
              filteredDubbing.map(d => {
                const tone = getStatusTone(d.status);
                const isKids = d.platform === 'LoopKids';
                const dubImg = getDubbingImage(d);

                return (
                  <div className="prod-card" key={d.id}>
                    {/* Top Contextual Visual Banner (ADR voice artist in sound booth at microphone) */}
                    <div className="prod-card-poster-wrap">
                      <img
                        src={dubImg}
                        alt={d.voiceArtist}
                        className="prod-card-poster-img"
                        loading="lazy"
                      />
                      <div className="prod-card-poster-gradient" />
                      <div className="prod-card-poster-badges">
                        <span
                          className="badge-tag platform"
                          style={{
                            background: isKids ? 'rgba(234, 179, 8, 0.25)' : 'rgba(42, 28, 22, 0.9)',
                            backdropFilter: 'blur(8px)',
                            border: isKids ? '1px solid #eab308' : '1px solid #4a2b1b',
                            color: isKids ? '#facc15' : '#f07842',
                            fontWeight: 700
                          }}
                        >
                          {d.platform}
                        </span>
                        <span className={`status-pill ${tone}`} style={{ backdropFilter: 'blur(8px)', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                          {d.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Top */}
                    <div className="prod-card-top">
                      <div className="prod-card-title-group">
                        <div className={`project-icon ${tone}`}>
                          <Languages size={20} />
                        </div>
                        <div>
                          <h3>{d.characterName}</h3>
                          <span>{d.id} · {d.targetLanguage} Localization</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Tags */}
                    <div className="prod-meta-tags">
                      <span className="badge-tag">{d.reelsOrEpisodes}</span>
                      <span className="badge-tag format">{d.targetLanguage}</span>
                      <span className="badge-tag" style={{ color: '#67d7a3', borderColor: '#2d4a3b' }}>{d.lipsyncQuality}</span>
                    </div>

                    {/* Timecode block */}
                    <div style={{ background: '#141414', borderRadius: '8px', padding: '10px 12px', border: '1px solid #262626' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888' }}>
                        <span>Timecode Cue</span>
                        <strong style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{d.timecode}</strong>
                      </div>
                    </div>

                    {/* Session Schedule Overview */}
                    <div className="prod-finance-row">
                      <div className="prod-finance-item">
                        <span>Session Slot</span>
                        <strong style={{ color: '#f07842' }}>{d.sessionDate}</strong>
                      </div>
                      <div className="prod-finance-item">
                        <span>Dubbing Director</span>
                        <strong>{d.dubbingDirector}</strong>
                      </div>
                    </div>

                    {/* Card Foot */}
                    <div className="prod-card-foot">
                      <div className="prod-foot-crew">
                        <div className="avatar avatar-blue" style={{ width: '28px', height: '28px', fontSize: '9px' }}>
                          <Volume2 size={14} />
                        </div>
                        <div>
                          <span>Voice Talent</span>
                          <strong style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {d.voiceArtist}
                          </strong>
                        </div>
                      </div>

                      <div className="prod-card-actions">
                        <button className="icon-button" onClick={() => setDetailItem(d)} title="Inspect Session Details">
                          <Eye size={16} />
                        </button>
                        <button className="icon-button" onClick={() => handleOpenEdit(d)} title="Edit Session">
                          <Edit3 size={16} />
                        </button>
                        <button className="icon-button" onClick={() => setDeleteTarget(d)} title="Delete Session" style={{ color: '#dc6464' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ================= LIST VIEW ================= */}
        {viewMode === 'list' && (
          <div className="production-list-grid" style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeTab === 'singers' ? (
              filteredSingers.map(s => {
                const tone = getStatusTone(s.recordingStatus);
                const singerImg = getSingerImage(s);
                return (
                  <div
                    className="prod-list-card"
                    key={s.id}
                    style={{
                      background: '#191919',
                      border: '1px solid #303030',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px', flex: '1.3' }}>
                      <div className="list-poster-thumb">
                        <img src={singerImg} alt={s.singerName} className="list-poster-img" loading="lazy" />
                        <div className="list-poster-overlay">
                          <Mic size={18} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '15px', color: '#f4f0eb', fontWeight: 750 }}>{s.songTitle}</h3>
                          <span className={`status-pill ${tone}`}>{s.recordingStatus}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: '#8a96a8' }}>{s.id} · {s.singerName}</span>
                          <span style={{ fontSize: '11px', color: '#555' }}>•</span>
                          <span className="badge-tag">{s.language}</span>
                          <span
                            className="badge-tag platform"
                            style={{
                              background: s.platform === 'LoopKids' ? 'rgba(234, 179, 8, 0.2)' : '#2a1c16',
                              border: s.platform === 'LoopKids' ? '1px solid rgba(234, 179, 8, 0.55)' : '1px solid #4a2b1b',
                              color: s.platform === 'LoopKids' ? '#facc15' : '#f07842',
                              fontWeight: 650
                            }}
                          >
                            {s.platform}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ minWidth: '130px', flex: '0.8' }}>
                      <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>VOCALIST & DIRECTOR</span>
                      <strong style={{ fontSize: '13px', color: '#f4f0eb', display: 'block' }}>{s.singerName}</strong>
                      <span style={{ fontSize: '11px', color: '#8a96a8' }}>{s.musicDirector}</span>
                    </div>

                    <div style={{ minWidth: '130px', flex: '0.8' }}>
                      <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>ARTIST FEE</span>
                      <strong style={{ fontSize: '13px', color: '#10b981' }}>{formatCurrency(s.fee)}</strong>
                      <span style={{ fontSize: '11px', color: '#8a96a8' }}>{s.duration}</span>
                    </div>

                    <div className="prod-card-actions" style={{ flexShrink: 0 }}>
                      <button className="icon-button" onClick={() => setDetailItem(s)} title="Inspect Track Details">
                        <Eye size={16} />
                      </button>
                      <button className="icon-button" onClick={() => handleOpenEdit(s)} title="Edit Track">
                        <Edit3 size={16} />
                      </button>
                      <button className="icon-button" onClick={() => setDeleteTarget(s)} title="Delete Track" style={{ color: '#dc6464' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              filteredDubbing.map(d => {
                const tone = getStatusTone(d.status);
                const dubImg = getDubbingImage(d);
                return (
                  <div
                    className="prod-list-card"
                    key={d.id}
                    style={{
                      background: '#191919',
                      border: '1px solid #303030',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px', flex: '1.3' }}>
                      <div className="list-poster-thumb">
                        <img src={dubImg} alt={d.voiceArtist} className="list-poster-img" loading="lazy" />
                        <div className="list-poster-overlay">
                          <Languages size={18} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '15px', color: '#f4f0eb', fontWeight: 750 }}>{d.characterName}</h3>
                          <span className={`status-pill ${tone}`}>{d.status}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: '#8a96a8' }}>{d.id} · {d.targetLanguage}</span>
                          <span style={{ fontSize: '11px', color: '#555' }}>•</span>
                          <span className="badge-tag">{d.reelsOrEpisodes}</span>
                          <span
                            className="badge-tag platform"
                            style={{
                              background: d.platform === 'LoopKids' ? 'rgba(234, 179, 8, 0.2)' : '#2a1c16',
                              border: d.platform === 'LoopKids' ? '1px solid rgba(234, 179, 8, 0.55)' : '1px solid #4a2b1b',
                              color: d.platform === 'LoopKids' ? '#facc15' : '#f07842',
                              fontWeight: 650
                            }}
                          >
                            {d.platform}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ minWidth: '130px', flex: '0.8' }}>
                      <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>VOICE ARTIST</span>
                      <strong style={{ fontSize: '13px', color: '#f4f0eb', display: 'block' }}>{d.voiceArtist}</strong>
                      <span style={{ fontSize: '11px', color: '#8a96a8' }}>Dir: {d.dubbingDirector}</span>
                    </div>

                    <div style={{ minWidth: '130px', flex: '0.8' }}>
                      <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>SESSION DATE</span>
                      <strong style={{ fontSize: '13px', color: '#f07842' }}>{d.sessionDate}</strong>
                      <span style={{ fontSize: '11px', color: '#8a96a8' }}>{d.sessionTime}</span>
                    </div>

                    <div className="prod-card-actions" style={{ flexShrink: 0 }}>
                      <button className="icon-button" onClick={() => setDetailItem(d)} title="Inspect Session Details">
                        <Eye size={16} />
                      </button>
                      <button className="icon-button" onClick={() => handleOpenEdit(d)} title="Edit Session">
                        <Edit3 size={16} />
                      </button>
                      <button className="icon-button" onClick={() => setDeleteTarget(d)} title="Delete Session" style={{ color: '#dc6464' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ================= TABULAR VIEW ================= */}
        {viewMode === 'table' && (
          <div className="table-wrap">
            {activeTab === 'singers' ? (
              <table>
                <thead>
                  <tr>
                    <th>TRACK & IDENTIFIER</th>
                    <th>PROJECT</th>
                    <th>LEAD SINGER</th>
                    <th>VOCAL TYPE & LANG</th>
                    <th>COMPOSER</th>
                    <th>ARTIST FEE</th>
                    <th>DISTRIBUTION</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSingers.map(s => {
                    const tone = getStatusTone(s.recordingStatus);
                    const singerImg = getSingerImage(s);
                    return (
                      <tr key={s.id}>
                        <td>
                          <div className="project-name" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="table-poster-thumb">
                              <img src={singerImg} alt={s.singerName} className="table-poster-img" loading="lazy" />
                            </div>
                            <div>
                              <strong>{s.songTitle}</strong>
                              <span>{s.id} · {s.duration}</span>
                            </div>
                          </div>
                        </td>
                        <td><span style={{ fontWeight: 600 }}>{s.project}</span></td>
                        <td><span style={{ color: '#f4f0eb', fontWeight: 650 }}>{s.singerName}</span></td>
                        <td>
                          <span className="badge-tag">{s.vocalType}</span>
                          <div style={{ fontSize: '11px', color: '#8a96a8', marginTop: '2px' }}>{s.language}</div>
                        </td>
                        <td>
                          <span style={{ color: '#ded7d0' }}>{s.musicDirector}</span>
                          <div style={{ fontSize: '11px', color: '#8a96a8' }}>{s.lyricist}</div>
                        </td>
                        <td><strong style={{ color: '#10b981' }}>{formatCurrency(s.fee)}</strong></td>
                        <td>
                          <span
                            className="badge-tag platform"
                            style={{
                              background: s.platform === 'LoopKids' ? 'rgba(234, 179, 8, 0.2)' : '#2a1c16',
                              border: s.platform === 'LoopKids' ? '1px solid rgba(234, 179, 8, 0.55)' : '1px solid #4a2b1b',
                              color: s.platform === 'LoopKids' ? '#facc15' : '#f07842',
                              fontWeight: 650
                            }}
                          >
                            {s.platform}
                          </span>
                        </td>
                        <td><span className={`status-pill ${tone}`}>{s.recordingStatus}</span></td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                            <button className="icon-button" onClick={() => setDetailItem(s)} title="Inspect Track Details">
                              <Eye size={16} />
                            </button>
                            <button className="icon-button" onClick={() => handleOpenEdit(s)} title="Edit Track">
                              <Edit3 size={16} />
                            </button>
                            <button className="icon-button" onClick={() => setDeleteTarget(s)} title="Delete Track" style={{ color: '#dc6464' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>CHARACTER & ID</th>
                    <th>PROJECT</th>
                    <th>VOICE TALENT</th>
                    <th>TARGET LANGUAGE</th>
                    <th>DUBBING DIRECTOR</th>
                    <th>SESSION DATE & TIME</th>
                    <th>DISTRIBUTION</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDubbing.map(d => {
                    const tone = getStatusTone(d.status);
                    const dubImg = getDubbingImage(d);
                    return (
                      <tr key={d.id}>
                        <td>
                          <div className="project-name" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="table-poster-thumb">
                              <img src={dubImg} alt={d.voiceArtist} className="table-poster-img" loading="lazy" />
                            </div>
                            <div>
                              <strong>{d.characterName}</strong>
                              <span>{d.id} · {d.reelsOrEpisodes}</span>
                            </div>
                          </div>
                        </td>
                        <td><span style={{ fontWeight: 600 }}>{d.project}</span></td>
                        <td><span style={{ color: '#f4f0eb', fontWeight: 650 }}>{d.voiceArtist}</span></td>
                        <td><span className="badge-tag">{d.targetLanguage}</span></td>
                        <td><span style={{ color: '#ded7d0' }}>{d.dubbingDirector}</span></td>
                        <td className="date-cell">
                          <strong style={{ color: '#f07842', display: 'block' }}>{d.sessionDate}</strong>
                          <span style={{ fontSize: '10.5px', color: '#8a96a8' }}>{d.sessionTime}</span>
                        </td>
                        <td>
                          <span
                            className="badge-tag platform"
                            style={{
                              background: d.platform === 'LoopKids' ? 'rgba(234, 179, 8, 0.2)' : '#2a1c16',
                              border: d.platform === 'LoopKids' ? '1px solid rgba(234, 179, 8, 0.55)' : '1px solid #4a2b1b',
                              color: d.platform === 'LoopKids' ? '#facc15' : '#f07842',
                              fontWeight: 650
                            }}
                          >
                            {d.platform}
                          </span>
                        </td>
                        <td><span className={`status-pill ${tone}`}>{d.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                            <button className="icon-button" onClick={() => setDetailItem(d)} title="Inspect Session Details">
                              <Eye size={16} />
                            </button>
                            <button className="icon-button" onClick={() => handleOpenEdit(d)} title="Edit Session">
                              <Edit3 size={16} />
                            </button>
                            <button className="icon-button" onClick={() => setDeleteTarget(d)} title="Delete Session" style={{ color: '#dc6464' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Empty Slate */}
        {((activeTab === 'singers' && filteredSingers.length === 0) || (activeTab === 'dubbing' && filteredDubbing.length === 0)) && (
          <div className="empty-state">
            <Mic size={36} style={{ color: '#e3652e', margin: '0 auto 12px', display: 'block', opacity: 0.8 }} />
            <strong style={{ display: 'block', color: '#f4f0eb', fontSize: '14px', marginBottom: '4px' }}>
              No audio records found
            </strong>
            <p style={{ margin: 0 }}>Try clearing your search query or reset filter selections.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
              onClick={handleOpenCreate}
            >
              <Plus size={16} /> {activeTab === 'singers' ? 'Add Singer Track' : 'Schedule Dubbing Session'}
            </button>
          </div>
        )}
      </div>

      {/* ================= MODAL: CREATE ITEM ================= */}
      {createModalOpen && (
        <div className="modal-backdrop" onClick={() => setCreateModalOpen(false)}>
          <form
            className="modal-card modal-card-lg"
            onSubmit={handleCreateSubmit}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2>{activeTab === 'singers' ? 'Register New Soundtrack Track' : 'Schedule Dubbing Session'}</h2>
                <p>
                  {activeTab === 'singers'
                    ? 'Contract playback singers, define duration, studio rates, and assign composers.'
                    : 'Roster multilingual voice talent, lock ADR timecodes, and schedule facility suites.'}
                </p>
              </div>
              <button type="button" className="icon-button" onClick={() => setCreateModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {activeTab === 'singers' ? (
              <>
                <div className="form-grid-2">
                  <label>
                    Song Title *
                    <input
                      required
                      placeholder="e.g. Baarish Ke Saaye"
                      value={singerFormData.songTitle}
                      onChange={e => setSingerFormData({ ...singerFormData, songTitle: e.target.value })}
                    />
                  </label>
                  <label>
                    Associated Production
                    <select
                      value={singerFormData.project}
                      onChange={e => setSingerFormData({ ...singerFormData, project: e.target.value })}
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    Lead Singer Name *
                    <input
                      required
                      placeholder="e.g. Arijit Singh"
                      value={singerFormData.singerName}
                      onChange={e => setSingerFormData({ ...singerFormData, singerName: e.target.value })}
                    />
                  </label>
                  <label>
                    Vocal Classification
                    <select
                      value={singerFormData.vocalType}
                      onChange={e => setSingerFormData({ ...singerFormData, vocalType: e.target.value })}
                    >
                      <option>Lead Vocalist (Male)</option>
                      <option>Lead Vocalist (Female)</option>
                      <option>Duet</option>
                      <option>Classical / Folk</option>
                      <option>Acoustic / Indie</option>
                      <option>Hip Hop / Electronic</option>
                    </select>
                  </label>
                  <label>
                    Track Language
                    <input
                      placeholder="e.g. Hindi"
                      value={singerFormData.language}
                      onChange={e => setSingerFormData({ ...singerFormData, language: e.target.value })}
                    />
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    Music Director / Composer
                    <input
                      placeholder="e.g. Amit Trivedi"
                      value={singerFormData.musicDirector}
                      onChange={e => setSingerFormData({ ...singerFormData, musicDirector: e.target.value })}
                    />
                  </label>
                  <label>
                    Lyricist
                    <input
                      placeholder="e.g. Varun Grover"
                      value={singerFormData.lyricist}
                      onChange={e => setSingerFormData({ ...singerFormData, lyricist: e.target.value })}
                    />
                  </label>
                  <label>
                    Duration
                    <input
                      placeholder="e.g. 4 mins 28 secs"
                      value={singerFormData.duration}
                      onChange={e => setSingerFormData({ ...singerFormData, duration: e.target.value })}
                    />
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    Artist Compensation (₹ INR)
                    <input
                      type="number"
                      placeholder="e.g. 2500000"
                      value={singerFormData.fee}
                      onChange={e => setSingerFormData({ ...singerFormData, fee: e.target.value })}
                    />
                  </label>
                  <label>
                    Recording Status
                    <select
                      value={singerFormData.recordingStatus}
                      onChange={e => setSingerFormData({ ...singerFormData, recordingStatus: e.target.value })}
                    >
                      <option>Mastered & Mixed</option>
                      <option>Recorded</option>
                      <option>In Studio</option>
                      <option>Scheduled</option>
                    </select>
                  </label>
                  <label>
                    Platform Target
                    <select
                      value={singerFormData.platform}
                      onChange={e => setSingerFormData({ ...singerFormData, platform: e.target.value })}
                    >
                      <option value="LoopNexus">LoopNexus</option>
                      <option value="LoopKids">LoopKids</option>
                    </select>
                  </label>
                </div>

                <label>
                  Recording Studio Facility
                  <input
                    placeholder="e.g. YRF Studios (Studio A), Mumbai"
                    value={singerFormData.recordingStudio}
                    onChange={e => setSingerFormData({ ...singerFormData, recordingStudio: e.target.value })}
                  />
                </label>
              </>
            ) : (
              <>
                <div className="form-grid-2">
                  <label>
                    Character Name *
                    <input
                      required
                      placeholder="e.g. SP Samarjit (Lead Inspector)"
                      value={dubbingFormData.characterName}
                      onChange={e => setDubbingFormData({ ...dubbingFormData, characterName: e.target.value })}
                    />
                  </label>
                  <label>
                    Associated Production
                    <select
                      value={dubbingFormData.project}
                      onChange={e => setDubbingFormData({ ...dubbingFormData, project: e.target.value })}
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    Target Language *
                    <input
                      required
                      placeholder="e.g. Tamil"
                      value={dubbingFormData.targetLanguage}
                      onChange={e => setDubbingFormData({ ...dubbingFormData, targetLanguage: e.target.value })}
                    />
                  </label>
                  <label>
                    Voice Talent / Artist *
                    <input
                      required
                      placeholder="e.g. P. Ravi Shankar"
                      value={dubbingFormData.voiceArtist}
                      onChange={e => setDubbingFormData({ ...dubbingFormData, voiceArtist: e.target.value })}
                    />
                  </label>
                  <label>
                    Dubbing Director
                    <input
                      placeholder="e.g. Mona Ghosh Shetty"
                      value={dubbingFormData.dubbingDirector}
                      onChange={e => setDubbingFormData({ ...dubbingFormData, dubbingDirector: e.target.value })}
                    />
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    Session Date
                    <input
                      type="date"
                      value={dubbingFormData.sessionDate}
                      onChange={e => setDubbingFormData({ ...dubbingFormData, sessionDate: e.target.value })}
                    />
                  </label>
                  <label>
                    Session Time Slot
                    <input
                      placeholder="e.g. 10:00 AM - 02:00 PM"
                      value={dubbingFormData.sessionTime}
                      onChange={e => setDubbingFormData({ ...dubbingFormData, sessionTime: e.target.value })}
                    />
                  </label>
                  <label>
                    Platform Target
                    <select
                      value={dubbingFormData.platform}
                      onChange={e => setDubbingFormData({ ...dubbingFormData, platform: e.target.value })}
                    >
                      <option value="LoopNexus">LoopNexus</option>
                      <option value="LoopKids">LoopKids</option>
                    </select>
                  </label>
                </div>

                <div className="form-grid-2">
                  <label>
                    Reels / Episodes Coverage
                    <input
                      placeholder="e.g. Episodes 1 to 4 · Reels 1-8"
                      value={dubbingFormData.reelsOrEpisodes}
                      onChange={e => setDubbingFormData({ ...dubbingFormData, reelsOrEpisodes: e.target.value })}
                    />
                  </label>
                  <label>
                    Timecode Cue Range
                    <input
                      placeholder="e.g. 00:00:00:00 - 02:45:30:00"
                      value={dubbingFormData.timecode}
                      onChange={e => setDubbingFormData({ ...dubbingFormData, timecode: e.target.value })}
                    />
                  </label>
                </div>
              </>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-light" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {activeTab === 'singers' ? 'Register Track' : 'Schedule Session'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: EDIT ITEM ================= */}
      {editItem && (
        <div className="modal-backdrop" onClick={() => setEditItem(null)}>
          <form
            className="modal-card modal-card-lg"
            onSubmit={handleEditSubmit}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2>Edit {activeTab === 'singers' ? `Soundtrack (${editItem.id})` : `Dubbing Session (${editItem.id})`}</h2>
                <p>Modify performance assignments, studio schedules, or compensation.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setEditItem(null)}>
                <X size={18} />
              </button>
            </div>

            {activeTab === 'singers' ? (
              <>
                <div className="form-grid-2">
                  <label>
                    Song Title
                    <input
                      required
                      value={singerFormData.songTitle}
                      onChange={e => setSingerFormData({ ...singerFormData, songTitle: e.target.value })}
                    />
                  </label>
                  <label>
                    Lead Singer
                    <input
                      required
                      value={singerFormData.singerName}
                      onChange={e => setSingerFormData({ ...singerFormData, singerName: e.target.value })}
                    />
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    Music Director
                    <input
                      value={singerFormData.musicDirector}
                      onChange={e => setSingerFormData({ ...singerFormData, musicDirector: e.target.value })}
                    />
                  </label>
                  <label>
                    Artist Fee (₹ INR)
                    <input
                      type="number"
                      value={singerFormData.fee}
                      onChange={e => setSingerFormData({ ...singerFormData, fee: e.target.value })}
                    />
                  </label>
                  <label>
                    Platform
                    <select
                      value={singerFormData.platform}
                      onChange={e => setSingerFormData({ ...singerFormData, platform: e.target.value })}
                    >
                      <option value="LoopNexus">LoopNexus</option>
                      <option value="LoopKids">LoopKids</option>
                    </select>
                  </label>
                </div>

                <div className="form-grid-2">
                  <label>
                    Recording Status
                    <select
                      value={singerFormData.recordingStatus}
                      onChange={e => setSingerFormData({ ...singerFormData, recordingStatus: e.target.value })}
                    >
                      <option>Mastered & Mixed</option>
                      <option>Recorded</option>
                      <option>In Studio</option>
                      <option>Scheduled</option>
                    </select>
                  </label>
                  <label>
                    Recording Studio
                    <input
                      value={singerFormData.recordingStudio}
                      onChange={e => setSingerFormData({ ...singerFormData, recordingStudio: e.target.value })}
                    />
                  </label>
                </div>
              </>
            ) : (
              <>
                <div className="form-grid-2">
                  <label>
                    Character Name
                    <input
                      required
                      value={dubbingFormData.characterName}
                      onChange={e => setDubbingFormData({ ...dubbingFormData, characterName: e.target.value })}
                    />
                  </label>
                  <label>
                    Voice Talent
                    <input
                      required
                      value={dubbingFormData.voiceArtist}
                      onChange={e => setDubbingFormData({ ...dubbingFormData, voiceArtist: e.target.value })}
                    />
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    Target Language
                    <input
                      value={dubbingFormData.targetLanguage}
                      onChange={e => setDubbingFormData({ ...dubbingFormData, targetLanguage: e.target.value })}
                    />
                  </label>
                  <label>
                    Session Date
                    <input
                      type="date"
                      value={dubbingFormData.sessionDate}
                      onChange={e => setDubbingFormData({ ...dubbingFormData, sessionDate: e.target.value })}
                    />
                  </label>
                  <label>
                    Platform
                    <select
                      value={dubbingFormData.platform}
                      onChange={e => setDubbingFormData({ ...dubbingFormData, platform: e.target.value })}
                    >
                      <option value="LoopNexus">LoopNexus</option>
                      <option value="LoopKids">LoopKids</option>
                    </select>
                  </label>
                </div>
              </>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-light" onClick={() => setEditItem(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: VIEW DETAILS ================= */}
      {detailItem && (
        <div className="modal-backdrop" onClick={() => setDetailItem(null)}>
          <div
            className="modal-card modal-card-lg"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '780px', overflow: 'hidden', padding: 0 }}
          >
            {/* Contextual Visual Header (Singer at mic / voice talent booth) */}
            <div style={{ position: 'relative', width: '100%', height: '170px', background: '#111', overflow: 'hidden' }}>
              <img
                src={activeTab === 'singers' ? getSingerImage(detailItem) : getDubbingImage(detailItem)}
                alt={activeTab === 'singers' ? detailItem.singerName : detailItem.voiceArtist}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%', filter: 'brightness(0.7) contrast(1.1)' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(25,25,25,0.6) 60%, #191919 100%)' }} />
              <button
                type="button"
                className="icon-button"
                onClick={() => setDetailItem(null)}
                style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 3 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '0 24px 24px 24px' }}>
              <div className="modal-head" style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={`project-icon ${getStatusTone(activeTab === 'singers' ? detailItem.recordingStatus : detailItem.status)}`}>
                    {activeTab === 'singers' ? <Mic size={22} /> : <Languages size={22} />}
                  </div>
                  <div>
                    <h2>{activeTab === 'singers' ? detailItem.songTitle : detailItem.characterName}</h2>
                    <p>{detailItem.id} · {detailItem.project} · {activeTab === 'singers' ? detailItem.singerName : detailItem.voiceArtist}</p>
                  </div>
                </div>
              </div>

              {/* Overview Section */}
              <div className="detail-section">
                <h4>Performance & Session Breakdown</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span>Status</span>
                    <strong className={`status-pill ${getStatusTone(activeTab === 'singers' ? detailItem.recordingStatus : detailItem.status)}`}>
                      {activeTab === 'singers' ? detailItem.recordingStatus : detailItem.status}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>Platform</span>
                    <strong
                      className="badge-tag platform"
                      style={{
                        background: detailItem.platform === 'LoopKids' ? 'rgba(234, 179, 8, 0.2)' : '#2a1c16',
                        border: detailItem.platform === 'LoopKids' ? '1px solid rgba(234, 179, 8, 0.55)' : '1px solid #4a2b1b',
                        color: detailItem.platform === 'LoopKids' ? '#facc15' : '#f07842',
                        fontWeight: 650
                      }}
                    >
                      {detailItem.platform}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>{activeTab === 'singers' ? 'Artist Fee' : 'Target Language'}</span>
                    <strong style={{ color: activeTab === 'singers' ? '#10b981' : '#60a5fa' }}>
                      {activeTab === 'singers' ? formatCurrency(detailItem.fee) : detailItem.targetLanguage}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>{activeTab === 'singers' ? 'Music Director' : 'Dubbing Director'}</span>
                    <strong>{activeTab === 'singers' ? detailItem.musicDirector : detailItem.dubbingDirector}</strong>
                  </div>
                </div>
              </div>

              {/* Studio & Technical Details */}
              <div className="detail-section">
                <h4>Facility & Licensing Specifications</h4>
                <p style={{ fontSize: '13px', color: '#c6bdb5', lineHeight: '1.6', margin: '0 0 8px' }}>
                  <strong>Facility:</strong> {activeTab === 'singers' ? detailItem.recordingStudio : detailItem.studioFacility}
                </p>
                {activeTab === 'singers' ? (
                  <p style={{ fontSize: '12.5px', color: '#8a96a8', margin: 0 }}>
                    ISRC: <span style={{ color: '#f07842', fontFamily: 'monospace' }}>{detailItem.isrcCode}</span> · Duration: {detailItem.duration}
                  </p>
                ) : (
                  <p style={{ fontSize: '12.5px', color: '#8a96a8', margin: 0 }}>
                    Timecode Cue: <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{detailItem.timecode}</span> · Quality: {detailItem.lipsyncQuality}
                  </p>
                )}
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-light" onClick={() => setDetailItem(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRM ================= */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '440px' }}
          >
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '8px', borderRadius: '8px', color: '#ef4444' }}>
                  <AlertCircle size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#fff' }}>Confirm Deletion</h3>
                  <span style={{ fontSize: '12px', color: '#888' }}>This action cannot be undone.</span>
                </div>
              </div>
              <button type="button" className="icon-button" onClick={() => setDeleteTarget(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '16px 0' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#ccc', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete{' '}
                <strong style={{ color: '#fff' }}>
                  {activeTab === 'singers' ? deleteTarget.songTitle : deleteTarget.characterName}
                </strong> ({deleteTarget.id})? All associated sound records will be purged.
              </p>
            </div>

            <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
