import { useState, useMemo, useEffect } from 'react';
import {
  Film,
  HardDrive,
  CheckCircle2,
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
  Sliders,
  Sparkles,
  Download,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  FolderLock,
  Layers,
  PlayCircle,
  Server,
  Cpu,
  MonitorPlay,
  Database,
  RefreshCw,
  Loader2
} from 'lucide-react';
import {
  postProductionApi,
  mediaAssetApi,
  extractPageItems,
  normalizePostProductionStatusToBackend,
  normalizePostProductionStatusToFrontend,
  normalizeMediaStatusToBackend,
  normalizeMediaStatusToFrontend
} from '../api/mediaAudioLegalApi.js';
import {
  resolvePostProductionPicture,
  resolveMediaAssetPicture
} from '../utils/mediaAudioLegalImages.js';
import MediaImagePicker from '../components/MediaImagePicker.jsx';
import {
  getStoredProjects,
} from '../utils/productionStorage.js';

export default function PostProductionMedia() {
  const [projects] = useState(() => getStoredProjects());
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'vault'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'table'

  // Data states
  const [postTasks, setPostTasks] = useState([]);
  const [mediaAssets, setMediaAssets] = useState([]);

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
      const [tasksRes, assetsRes] = await Promise.all([
        postProductionApi.list({ size: 100 }),
        mediaAssetApi.list({ size: 100 })
      ]);

      const items = extractPageItems(tasksRes);
      if (items.length > 0) {
        const mapped = items.map(item => ({
          id: item.id,
          title: item.name || 'Untitled Milestone',
          project: item.projectRef || 'General',
          stage: item.description || 'Color Grading (DI)',
          status: normalizePostProductionStatusToFrontend(item.status),
          targetDeliveryDate: item.dueAt || '',
          supervisor: item.assigneeName || 'Unassigned',
          leadArtist: item.assigneeName || 'Unassigned',
          facility: '—',
          progress: item.status === 'COMPLETED' ? 100 : 0,
          reelsCount: '—',
          qcStatus: 'Not specified',
          platform: '—',
          tone: item.status === 'COMPLETED' ? 'green' : 'orange',
          image: item.image || resolvePostProductionPicture(item),
          startedAt: item.startedAt,
          active: item.active
        }));
        setPostTasks(mapped);
      } else {
        setPostTasks([]);
      }

      const assetItems = extractPageItems(assetsRes);
      if (assetItems.length > 0) {
        const mappedAssets = assetItems.map(item => ({
          id: item.id,
          title: item.name || 'Master Deliverable',
          project: item.projectRef || 'General',
          assetType: item.assetType || 'Master Cut',
          status: normalizeMediaStatusToFrontend(item.status),
          storageLocation: item.storageReference || '—',
          codecFormat: item.format || '—',
          fileSize: item.sizeBytes ? (item.sizeBytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB' : '0 GB',
          duration: item.durationSeconds ? Math.floor(item.durationSeconds / 60) + ' mins' : '—',
          resolution: '—',
          platform: '—',
          uploadDate: item.createdAt ? item.createdAt.slice(0, 10) : new Date().toISOString().split('T')[0],
          image: item.image || resolveMediaAssetPicture(item),
          notes: item.notes,
          active: item.active
        }));
        setMediaAssets(mappedAssets);
      } else {
        setMediaAssets([]);
      }
    } catch (err) {
      console.warn('Backend fetch error in PostProductionMedia:', err);
      setApiError(err.message || 'Could not connect to live backend.');
      setPostTasks([]);
      setMediaAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL'); // 'ALL' | 'LoopNexus' | 'LoopKids'
  const [stageFilter, setStageFilter] = useState('ALL');
  const [assetTypeFilter, setAssetTypeFilter] = useState('ALL');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form states
  const initialTaskForm = {
    project: projects[0]?.name || 'The Last Monsoon',
    title: '',
    stage: 'Color Grading (DI)',
    supervisor: '',
    leadArtist: '',
    facility: '',
    progress: 50,
    status: 'In Progress',
    targetDeliveryDate: new Date().toISOString().split('T')[0],
    reelsCount: '4 Reels',
    qcStatus: 'Under Review',
    platform: 'LoopNexus',
    notes: '',
    image: ''
  };

  const initialAssetForm = {
    project: projects[0]?.name || 'The Last Monsoon',
    title: '',
    assetType: 'Master Cut',
    resolution: '4K UHD (3840x2160)',
    codecFormat: 'Apple ProRes 4444 XQ',
    fileSize: '150.0 GB',
    version: 'v1.0 (Master)',
    storageLocation: 'Loop Cloud Vault - Hot Tier',
    checksum: '',
    status: 'QC Passed',
    uploadedBy: 'Studio North Post Lab',
    uploadDate: new Date().toISOString().split('T')[0],
    platform: 'LoopNexus',
    accessUrl: '',
    image: ''
  };

  const [taskFormData, setTaskFormData] = useState(initialTaskForm);
  const [assetFormData, setAssetFormData] = useState(initialAssetForm);

  // Tone mapping helper
  const getStatusTone = (status) => {
    switch (status) {
      case 'Approved':
      case 'QC Passed':
      case 'Completed':
        return 'green';
      case 'Pending Review':
      case 'Under Review':
        return 'orange';
      case 'In Progress':
      case 'Active Delivery':
        return 'blue';
      case 'Archived':
        return 'purple';
      default:
        return 'blue';
    }
  };

  // KPI Metrics
  const totalTasksCount = postTasks.length;
  const inProgressTasks = postTasks.filter(t => t.status === 'In Progress').length;
  const totalAssetsCount = mediaAssets.length;
  const qcPassedAssets = mediaAssets.filter(a => a.status === 'QC Passed').length;

  const totalStorageGB = useMemo(() => {
    return mediaAssets.reduce((acc, a) => {
      const match = a.fileSize?.match(/([\d.]+)\s*(GB|TB)/i);
      if (match) {
        const val = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        return acc + (unit === 'TB' ? val * 1024 : val);
      }
      return acc + 10;
    }, 0);
  }, [mediaAssets]);

  // Filtered Task Pipelines
  const filteredTasks = useMemo(() => {
    return postTasks.filter(item => {
      if (platformFilter !== 'ALL' && item.platform.toLowerCase() !== platformFilter.toLowerCase()) {
        return false;
      }
      if (stageFilter !== 'ALL' && item.stage !== stageFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchProj = item.project?.toLowerCase().includes(q);
        const matchSupervisor = item.supervisor?.toLowerCase().includes(q);
        const matchArtist = item.leadArtist?.toLowerCase().includes(q);
        const matchFacility = item.facility?.toLowerCase().includes(q);
        const matchStage = item.stage?.toLowerCase().includes(q);
        const matchId = String(item.id ?? '').toLowerCase().includes(q);
        return matchTitle || matchProj || matchSupervisor || matchArtist || matchFacility || matchStage || matchId;
      }
      return true;
    });
  }, [postTasks, platformFilter, stageFilter, searchQuery]);

  // Filtered Media Assets
  const filteredAssets = useMemo(() => {
    return mediaAssets.filter(item => {
      if (platformFilter !== 'ALL' && item.platform.toLowerCase() !== platformFilter.toLowerCase()) {
        return false;
      }
      if (assetTypeFilter !== 'ALL' && item.assetType !== assetTypeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchProj = item.project?.toLowerCase().includes(q);
        const matchType = item.assetType?.toLowerCase().includes(q);
        const matchCodec = item.codecFormat?.toLowerCase().includes(q);
        const matchStorage = item.storageLocation?.toLowerCase().includes(q);
        const matchId = String(item.id ?? '').toLowerCase().includes(q);
        return matchTitle || matchProj || matchType || matchCodec || matchStorage || matchId;
      }
      return true;
    });
  }, [mediaAssets, platformFilter, assetTypeFilter, searchQuery]);

  // Open Create
  const handleOpenCreate = () => {
    if (activeTab === 'pipeline') {
      setTaskFormData({
        ...initialTaskForm,
        project: projects[0]?.name || 'The Last Monsoon',
        targetDeliveryDate: new Date().toISOString().split('T')[0]
      });
    } else {
      setAssetFormData({
        ...initialAssetForm,
        project: projects[0]?.name || 'The Last Monsoon',
        uploadDate: new Date().toISOString().split('T')[0]
      });
    }
    setCreateModalOpen(true);
  };

  // Submit Create
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeTab === 'pipeline') {
        if (!taskFormData.title.trim()) return;
        const backendStatus = normalizePostProductionStatusToBackend(taskFormData.status);
        const payload = {
          name: taskFormData.title.trim(),
          description: taskFormData.stage || taskFormData.title,
          projectRef: taskFormData.project,
          status: backendStatus,
          priority: 'Normal',
          dueAt: taskFormData.targetDeliveryDate || null,
          startedAt: new Date().toISOString().split('T')[0],
          completedAt: backendStatus === 'COMPLETED' ? (taskFormData.targetDeliveryDate || new Date().toISOString().split('T')[0]) : null,
          notes: taskFormData.notes || '',
          active: true,
          image: taskFormData.image || ''
        };

        try {
          const created = await postProductionApi.create(payload);
          const mappedNew = {
            ...taskFormData,
            id: created.id,
            title: created.name || taskFormData.title,
            image: taskFormData.image || resolvePostProductionPicture(created)
          };
          setPostTasks(prev => [mappedNew, ...prev]);
          showToast('Post-production milestone created successfully on backend!');
        } catch (apiErr) {
          setApiError(apiErr.message || 'Unable to create the post-production task.');
          showToast(apiErr.message || 'Unable to create the post-production task.', 'error');
          return;
        }
      } else {
        if (!assetFormData.title.trim()) return;
        const backendStatus = normalizeMediaStatusToBackend(assetFormData.status);
        const payload = {
          name: assetFormData.title.trim(),
          description: assetFormData.assetType || assetFormData.title,
          projectRef: assetFormData.project,
          assetType: (assetFormData.assetType || 'MASTER_VIDEO').toUpperCase().replace(/\s+/g, '_'),
          status: backendStatus,
          storageReference: assetFormData.storageLocation || 's3://loopstream-vault/',
          format: assetFormData.codecFormat || 'ProRes 4444',
          sizeBytes: Number.isFinite(Number.parseFloat(assetFormData.fileSize))
            ? Math.round(Number.parseFloat(assetFormData.fileSize) * 1024 ** 3)
            : null,
          notes: assetFormData.checksum || '',
          active: true,
          image: assetFormData.image || ''
        };

        try {
          const created = await mediaAssetApi.create(payload);
          const mappedNew = {
            ...assetFormData,
            id: created.id,
            title: created.name || assetFormData.title,
            image: assetFormData.image || resolveMediaAssetPicture(created)
          };
          setMediaAssets(prev => [mappedNew, ...prev]);
          showToast('Media asset ingested into backend vault successfully!');
        } catch (apiErr) {
          setApiError(apiErr.message || 'Unable to create the media asset.');
          showToast(apiErr.message || 'Unable to create the media asset.', 'error');
          return;
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
    if (activeTab === 'pipeline') {
      setTaskFormData({
        project: item.project,
        title: item.title,
        stage: item.stage,
        supervisor: item.supervisor,
        leadArtist: item.leadArtist,
        facility: item.facility,
        progress: item.progress,
        status: item.status,
        targetDeliveryDate: item.targetDeliveryDate,
        reelsCount: item.reelsCount,
        qcStatus: item.qcStatus,
        platform: item.platform,
        notes: item.notes || '',
        image: item.image || ''
      });
    } else {
      setAssetFormData({
        project: item.project,
        title: item.title,
        assetType: item.assetType,
        resolution: item.resolution,
        codecFormat: item.codecFormat,
        fileSize: item.fileSize,
        version: item.version,
        storageLocation: item.storageLocation,
        checksum: item.checksum,
        status: item.status,
        uploadedBy: item.uploadedBy,
        uploadDate: item.uploadDate,
        platform: item.platform,
        accessUrl: item.accessUrl || '',
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

      if (activeTab === 'pipeline') {
        const backendStatus = normalizePostProductionStatusToBackend(taskFormData.status);
        const payload = {
          name: taskFormData.title.trim(),
          description: taskFormData.stage || taskFormData.title,
          projectRef: taskFormData.project,
          status: backendStatus,
          priority: 'Normal',
          dueAt: taskFormData.targetDeliveryDate || null,
          startedAt: editItem.startedAt || new Date().toISOString().split('T')[0],
          completedAt: backendStatus === 'COMPLETED' ? (taskFormData.targetDeliveryDate || new Date().toISOString().split('T')[0]) : null,
          notes: taskFormData.notes || '',
          active: true,
          image: taskFormData.image || ''
        };

        if (isNumericId) {
          try {
            await postProductionApi.update(editItem.id, payload);
            setPostTasks(prev => prev.map(t => (t.id === editItem.id ? { ...t, ...taskFormData } : t)));
            showToast('Post-production milestone updated successfully on backend!');
          } catch (apiErr) {
            setApiError(apiErr.message || 'Unable to update the post-production task.');
            showToast(apiErr.message || 'Unable to update the post-production task.', 'error');
            return;
          }
        } else {
          setApiError('This task does not have a backend record ID.');
          showToast('This task cannot be updated because it has no backend record ID.', 'error');
          return;
        }
      } else {
        const backendStatus = normalizeMediaStatusToBackend(assetFormData.status);
        const payload = {
          name: assetFormData.title.trim(),
          description: assetFormData.assetType || assetFormData.title,
          projectRef: assetFormData.project,
          assetType: (assetFormData.assetType || 'MASTER_VIDEO').toUpperCase().replace(/\s+/g, '_'),
          status: backendStatus,
          storageReference: assetFormData.storageLocation || 's3://loopstream-vault/',
          format: assetFormData.codecFormat || 'ProRes 4444',
          sizeBytes: Number.isFinite(Number.parseFloat(assetFormData.fileSize))
            ? Math.round(Number.parseFloat(assetFormData.fileSize) * 1024 ** 3)
            : null,
          notes: assetFormData.checksum || '',
          active: true,
          image: assetFormData.image || ''
        };

        if (isNumericId) {
          try {
            await mediaAssetApi.update(editItem.id, payload);
            setMediaAssets(prev => prev.map(a => (a.id === editItem.id ? { ...a, ...assetFormData } : a)));
            showToast('Media asset updated successfully on backend!');
          } catch (apiErr) {
            setApiError(apiErr.message || 'Unable to update the media asset.');
            showToast(apiErr.message || 'Unable to update the media asset.', 'error');
            return;
          }
        } else {
          setApiError('This asset does not have a backend record ID.');
          showToast('This asset cannot be updated because it has no backend record ID.', 'error');
          return;
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

      if (activeTab === 'pipeline') {
        if (isNumericId) {
          try {
            await postProductionApi.delete(deleteTarget.id);
            setPostTasks(prev => prev.filter(t => t.id !== deleteTarget.id));
            showToast('Post-production milestone deleted from backend.');
          } catch (apiErr) {
            setApiError(apiErr.message || 'Unable to delete the post-production task.');
            showToast(apiErr.message || 'Unable to delete the post-production task.', 'error');
            return;
          }
        } else {
          setApiError('This task does not have a backend record ID.');
          showToast('This task cannot be deleted because it has no backend record ID.', 'error');
          return;
        }
      } else {
        if (isNumericId) {
          try {
            await mediaAssetApi.delete(deleteTarget.id);
            setMediaAssets(prev => prev.filter(a => a.id !== deleteTarget.id));
            showToast('Media asset deleted from backend vault.');
          } catch (apiErr) {
            setApiError(apiErr.message || 'Unable to delete the media asset.');
            showToast(apiErr.message || 'Unable to delete the media asset.', 'error');
            return;
          }
        } else {
          setApiError('This asset does not have a backend record ID.');
          showToast('This asset cannot be deleted because it has no backend record ID.', 'error');
          return;
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
        ::-webkit-scrollbar-thumb:hover { background: #EFC348; }

        .production-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
          gap: 22px;
          align-items: stretch;
          width: 100%;
          box-sizing: border-box;
          padding: 0 20px 20px !important;
        }

        .prod-card, .prod-list-card {
          transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.24s ease, 
                      box-shadow 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .prod-card {
          display: flex !important;
          flex-direction: column !important;
          gap: 13px !important;
          background: #181716 !important;
          border: 1px solid #2b2825 !important;
          border-radius: 14px !important;
          box-sizing: border-box !important;
          padding: 16px 18px 16px 18px !important;
          padding-top: 0 !important;
          overflow: hidden !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.25s ease, 
                      box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
          position: relative;
        }
        .prod-card:hover {
          transform: translateY(-4px) !important;
          border-color: #EFC348 !important;
          box-shadow: 0 14px 32px -4px rgba(0, 0, 0, 0.7), 
                      0 0 0 1px rgba(239, 195, 72, 0.35), 
                      0 0 24px rgba(239, 195, 72, 0.12) !important;
        }

        .prod-card-poster-wrap {
          position: relative;
          width: calc(100% + 36px);
          margin: 0 -18px 0 -18px !important;
          height: 160px;
          overflow: hidden;
          background: #11100f;
          border-top-left-radius: 13px;
          border-top-right-radius: 13px;
        }
        .prod-card-poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), filter 0.45s ease;
          filter: brightness(0.86) contrast(1.08);
          display: block;
        }
        .prod-card:hover .prod-card-poster-img {
          transform: scale(1.06);
          filter: brightness(1.02) contrast(1.15);
        }
        .prod-card-poster-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(20,19,18,0.25) 45%, #181716 100%);
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
          pointer-events: none;
        }
        .prod-card-poster-badges > * {
          pointer-events: auto;
        }

        .prod-list-card {
          background: #181716 !important;
          border: 1px solid #2b2825 !important;
          border-radius: 12px !important;
          padding: 14px 18px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 16px !important;
          flex-wrap: wrap !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
          transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.24s ease, 
                      box-shadow 0.24s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .prod-list-card:hover {
          transform: translateY(-3px) translateX(2px) !important;
          border-color: #EFC348 !important;
          box-shadow: 0 14px 30px -6px rgba(0, 0, 0, 0.65), 
                      0 0 0 1px rgba(239, 195, 72, 0.35), 
                      0 0 20px rgba(239, 195, 72, 0.1) !important;
        }
        .prod-list-card:hover strong,
        .prod-list-card:hover h3 {
          color: #ffffff !important;
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
          color: #EFC348;
        }
        .prod-list-card:hover .list-poster-thumb {
          transform: scale(1.06);
          border-color: rgba(239, 195, 72, 0.6); box-shadow: 0 6px 18px rgba(0, 0, 0, 0.6), 0 0 14px rgba(239, 195, 72, 0.25);
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
          border-color: #EFC348; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 10px rgba(239, 195, 72, 0.3);
        }
        .table-wrap tr:hover .table-poster-img {
          transform: scale(1.1);
          filter: brightness(1.05) contrast(1.15);
        }

        .prod-card:hover .project-icon, .prod-list-card:hover .project-icon {
          transform: scale(1.1) rotate(2deg);
          box-shadow: 0 4px 14px rgba(239, 195, 72, 0.35);
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

        .prod-card-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .prod-card-actions .icon-button {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #201e1c;
          border: 1px solid #36322e;
          color: #a89f91;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .prod-card-actions .icon-button:hover,
        .table-wrap .icon-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }
        .prod-card-actions .action-view:hover,
        .prod-card-actions .icon-button[title*="View"]:hover,
        .prod-card-actions .icon-button[title*="Inspect"]:hover,
        .table-wrap .icon-button[title*="View"]:hover,
        .table-wrap .icon-button[title*="Inspect"]:hover {
          color: #38bdf8 !important;
          border-color: #0284c7 !important;
          background: rgba(14, 165, 233, 0.15) !important;
        }
        .prod-card-actions .action-edit:hover,
        .prod-card-actions .icon-button[title*="Edit"]:hover,
        .table-wrap .icon-button[title*="Edit"]:hover,
        .table-wrap .action-edit:hover,
        .icon-button[title*="Edit"]:hover,
        .icon-button[title*="Edit"]:focus,
        .action-edit:hover,
        .action-edit:focus {
          color: #EFC348 !important;
          border-color: #DEA737 !important;
          background: rgba(239, 195, 72, 0.15) !important;
          box-shadow: 0 0 12px rgba(239, 195, 72, 0.28) !important;
        }
        .prod-card-actions .action-delete:hover,
        .prod-card-actions .icon-button[title*="Delete"]:hover,
        .table-wrap .icon-button[title*="Delete"]:hover {
          color: #ef4444 !important;
          border-color: #dc2626 !important;
          background: rgba(239, 68, 68, 0.15) !important;
        }

        .mini-stat {
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.22s ease, 
                      box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mini-stat:hover {
          transform: translateY(-3px);
          border-color: rgba(239, 195, 72, 0.5) !important;
          box-shadow: 0 10px 24px -4px rgba(0, 0, 0, 0.5), 
                      0 0 16px rgba(239, 195, 72, 0.12) !important;
        }

        .filter-tab-pill {
          transition: transform 0.18s ease, border-color 0.18s ease, color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
        }
        .filter-tab-pill:hover {
          transform: translateY(-2px);
          border-color: #EFC348 !important;
          color: #ffffff !important;
          background: rgba(239, 195, 72, 0.12) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
        }

        .table-wrap tbody tr {
          transition: background-color 0.2s ease, box-shadow 0.2s ease;
        }
        .table-wrap tbody tr:hover td {
          background: #201e18 !important;
        }
        .table-wrap tbody tr:hover td:first-child {
          box-shadow: inset 3px 0 0 #EFC348;
        }

        .table-search {
          border: 1px solid #303030 !important;
          outline: none !important;
          box-shadow: none !important;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .table-search:hover { border-color: rgba(239, 195, 72, 0.5) !important; }
        .table-search:focus-within {
          border-color: #EFC348 !important;
          box-shadow: 0 0 0 2px rgba(239, 195, 72, 0.25) !important;
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

        
        .filter-tab-pill.active {
          background: rgba(239, 195, 72, 0.16) !important;
          color: #EFC348 !important;
          border-color: #EFC348 !important;
          font-weight: 750 !important;
          box-shadow: 0 0 12px rgba(239, 195, 72, 0.18) !important;
        }
        .filter-tab-pill.active:hover {
          background: rgba(239, 195, 72, 0.25) !important;
          color: #EFC348 !important;
          box-shadow: 0 4px 14px rgba(239, 195, 72, 0.4);
        }

        /* Lead Artist & Crew Profile Avatars - Cinema Gold */
        .prod-foot-crew .avatar,
        .avatar.avatar-blue,
        .prod-card .avatar,
        .prod-list-card .avatar {
          background: rgba(239, 195, 72, 0.18) !important;
          color: #EFC348 !important;
          border: 1px solid rgba(239, 195, 72, 0.45) !important;
          font-weight: 750 !important;
        }

        /* Cinema Gold Theme Enhancements */
        .btn-primary,
        button.btn-primary,
        .btn.btn-primary,
        .heading-actions .btn-primary,
        .empty-state .btn-primary,
        .empty-state button,
        form.modal-card .btn-primary,
        .modal-card .btn-primary,
        .modal-actions .btn-primary,
        .detail-modal .btn-primary {
          background: #EFC348 !important;
          border-color: #EFC348 !important;
          color: #000000 !important;
          font-weight: 750 !important;
          box-shadow: 0 4px 14px rgba(239, 195, 72, 0.35) !important;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease !important;
        }
        .btn-primary:hover,
        button.btn-primary:hover,
        .btn.btn-primary:hover,
        .heading-actions .btn-primary:hover,
        .empty-state .btn-primary:hover,
        .empty-state button:hover,
        form.modal-card .btn-primary:hover,
        .modal-card .btn-primary:hover,
        .modal-actions .btn-primary:hover,
        .detail-modal .btn-primary:hover {
          background: #F9D558 !important;
          border-color: #F9D558 !important;
          color: #000000 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 22px rgba(239, 195, 72, 0.5) !important;
        }

        .segmented button.chosen {
          background: #EFC348 !important;
          color: #000000 !important;
          font-weight: 750 !important;
        }

        .status-pill.orange,
        .status-pill[class*="orange"] {
          background: rgba(239, 195, 72, 0.16) !important;
          border: 1px solid #5a4515 !important;
          color: #EFC348 !important;
        }

        .badge-tag.platform {
          background: rgba(38, 30, 15, 0.9) !important;
          border: 1px solid #5a4515 !important;
          color: #EFC348 !important;
          font-weight: 700 !important;
        }

        /* Modal Form Control Focus & Hover - Cinema Gold */
        input:hover,
        select:hover,
        textarea:hover,
        .modal-card input:hover,
        .modal-card select:hover,
        .modal-card textarea:hover,
        .form-grid input:hover,
        .form-grid select:hover,
        .form-grid textarea:hover,
        .form-grid-2 input:hover,
        .form-grid-2 select:hover,
        .form-grid-2 textarea:hover,
        .form-grid-3 input:hover,
        .form-grid-3 select:hover,
        .form-grid-3 textarea:hover {
          border-color: rgba(239, 195, 72, 0.5) !important;
        }

        input:focus,
        input:focus-visible,
        select:focus,
        select:focus-visible,
        textarea:focus,
        textarea:focus-visible,
        .modal-card input:focus,
        .modal-card input:focus-visible,
        .modal-card select:focus,
        .modal-card select:focus-visible,
        .modal-card textarea:focus,
        .modal-card textarea:focus-visible,
        .form-grid input:focus,
        .form-grid input:focus-visible,
        .form-grid select:focus,
        .form-grid select:focus-visible,
        .form-grid textarea:focus,
        .form-grid textarea:focus-visible,
        .form-grid-2 input:focus,
        .form-grid-2 input:focus-visible,
        .form-grid-2 select:focus,
        .form-grid-2 select:focus-visible,
        .form-grid-2 textarea:focus,
        .form-grid-2 textarea:focus-visible,
        .form-grid-3 input:focus,
        .form-grid-3 input:focus-visible,
        .form-grid-3 select:focus,
        .form-grid-3 select:focus-visible,
        .form-grid-3 textarea:focus,
        .form-grid-3 textarea:focus-visible {
          border-color: #EFC348 !important;
          box-shadow: 0 0 0 3px rgba(239, 195, 72, 0.25) !important;
          outline: none !important;
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
        .detail-section h4,
        h4,
        .modal-card h4,
        .detail-modal h4 {
          font-size: 12.5px !important;
          color: #EFC348 !important;
          font-weight: 800 !important;
        }
        .detail-item span { font-size: 10.5px !important; }
        .detail-item strong { font-size: 13px !important; }
      `}</style>

      {/* Top Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> MEDIA, AUDIO & LEGAL MANAGEMENT
          </div>
          <h1>Post-Production & Media Assets</h1>
          <p>
            Track technical DI color grading, Dolby Atmos sound design, VFX composite pipelines, and cloud-vaulted media masters.
          </p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-primary" style={{ background: '#EFC348', borderColor: '#EFC348', color: '#000000', fontWeight: 750 }} onClick={handleOpenCreate}>
            <Plus size={18} /> {activeTab === 'pipeline' ? 'New Post Milestone' : 'Ingest Media Asset'}
          </button>
        </div>
      </div>

      {apiError && <div className="empty-state" role="alert">{apiError}</div>}
      {loading && <div className="empty-state">Loading media records…</div>}

      {/* Mini Stats KPI */}
      <div className="mini-stats">
        <div className="mini-stat">
          <span>Post Milestones</span>
          <strong>{totalTasksCount}</strong>
        </div>
        <div className="mini-stat">
          <span>In Active Post</span>
          <strong style={{ color: '#EFC348' }}>{inProgressTasks}</strong>
        </div>
        <div className="mini-stat">
          <span>Master Media Assets</span>
          <strong style={{ color: '#67d7a3' }}>{totalAssetsCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Vault Storage Used</span>
          <strong>{(totalStorageGB / 1024).toFixed(2)} TB</strong>
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
              className={activeTab === 'pipeline' ? 'chosen' : ''}
              onClick={() => setActiveTab('pipeline')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 15px', fontSize: '12px' }}
            >
              <Cpu size={16} /> Post-Production Pipelines
            </button>
            <button
              type="button"
              className={activeTab === 'vault' ? 'chosen' : ''}
              onClick={() => setActiveTab('vault')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 15px', fontSize: '12px' }}
            >
              <FolderLock size={16} /> Media Asset Vault
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
                placeholder={activeTab === 'pipeline' ? 'Search tasks, supervisors, labs...' : 'Search assets, formats, codecs...'}
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

          {/* Secondary Stage or Asset Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8a96a8', letterSpacing: '1px' }}>
              {activeTab === 'pipeline' ? 'STAGE:' : 'ASSET TYPE:'}
            </span>
            <div className="filter-tabs">
              {activeTab === 'pipeline' ? (
                ['ALL', 'Color Grading (DI)', 'Sound Design & Atmos Mix', 'VFX Compositing', 'Offline Edit', 'QC & Mastering'].map(st => (
                  <button
                    key={st}
                    type="button"
                    className={`filter-tab-pill ${stageFilter.toLowerCase() === st.toLowerCase() ? 'active' : ''}`}
                    onClick={() => setStageFilter(st)}
                  >
                    {st === 'ALL' ? 'All Stages' : st}
                  </button>
                ))
              ) : (
                ['ALL', 'Master Cut', 'Sound Stems / Atmos', 'DCP / Cinema Master', 'VFX Plate', 'Subtitle / IMF Package', 'Marketing Key Art & Promo'].map(at => (
                  <button
                    key={at}
                    type="button"
                    className={`filter-tab-pill ${assetTypeFilter.toLowerCase() === at.toLowerCase() ? 'active' : ''}`}
                    onClick={() => setAssetTypeFilter(at)}
                  >
                    {at === 'ALL' ? 'All Asset Types' : at}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ================= CARD GRID VIEW ================= */}
        {viewMode === 'grid' && (
          <div className="production-grid">
            {activeTab === 'pipeline' ? (
              filteredTasks.map(t => {
                const tone = getStatusTone(t.status);
                const isKids = t.platform === 'LoopKids';
                const postImg = t.image || resolvePostProductionPicture(t);

                return (
                  <div className="prod-card" key={t.id}>
                    {/* Top Contextual Visual Banner (Color grading, Atmos studio, VFX render) */}
                    <div className="prod-card-poster-wrap">
                      <img
                        src={postImg}
                        alt={t.title}
                        className="prod-card-poster-img"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = resolvePostProductionPicture(t); }}
                      />
                      <div className="prod-card-poster-gradient" />
                      <div className="prod-card-poster-badges">
                        <span
                          className="badge-tag platform"
                          style={{
                            background: isKids ? 'rgba(239, 195, 72, 0.25)' : 'rgba(38, 30, 15, 0.9)',
                            backdropFilter: 'blur(8px)',
                            border: isKids ? '1px solid #EFC348' : '1px solid #5a4515',
                            color: isKids ? '#F9D558' : '#EFC348',
                            fontWeight: 700
                          }}
                        >
                          {t.platform}
                        </span>
                        <span className={`status-pill ${tone}`} style={{ backdropFilter: 'blur(8px)', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                          {t.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Top */}
                    <div className="prod-card-top">
                      <div className="prod-card-title-group">
                        <div className={`project-icon ${tone}`}>
                          <Sliders size={20} />
                        </div>
                        <div>
                          <h3>{t.title}</h3>
                          <span>{t.id} · {t.project}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Tags */}
                    <div className="prod-meta-tags">
                      <span className="badge-tag">{t.stage}</span>
                      <span className="badge-tag format">{t.reelsCount}</span>
                      <span className="badge-tag" style={{ color: '#67d7a3', borderColor: '#2d4a3b' }}>{t.qcStatus}</span>
                    </div>

                    {/* Notes */}
                    {t.notes && <p className="prod-synopsis">{t.notes}</p>}

                    {/* Progress Track */}
                    <div className="prod-progress-block">
                      <div className="prod-progress-head">
                        <span>Milestone Progress</span>
                        <strong>{t.progress}%</strong>
                      </div>
                      <div className="progress-track" style={{ width: '100%', height: '6px' }}>
                        <div
                          className={`progress-fill ${tone}`}
                          style={{ width: `${Math.min(100, Math.max(0, t.progress))}%` }}
                        />
                      </div>
                    </div>

                    {/* Lab & Facility Overview */}
                    <div className="prod-finance-row">
                      <div className="prod-finance-item">
                        <span>Supervisor Lab</span>
                        <strong>{t.supervisor}</strong>
                      </div>
                      <div className="prod-finance-item">
                        <span>Delivery Date</span>
                        <strong style={{ color: '#EFC348' }}>{t.targetDeliveryDate || 'TBD'}</strong>
                      </div>
                    </div>

                    {/* Card Foot */}
                    <div className="prod-card-foot">
                      <div className="prod-foot-crew">
                        <div className="avatar avatar-blue" style={{ width: '28px', height: '28px', fontSize: '9px', background: 'rgba(239, 195, 72, 0.18)', color: '#EFC348', border: '1px solid rgba(239, 195, 72, 0.45)', fontWeight: 750 }}>
                          {t.leadArtist ? t.leadArtist.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase() : 'PP'}
                        </div>
                        <div>
                          <span>Lead Artist</span>
                          <strong>{t.leadArtist}</strong>
                        </div>
                      </div>

                      <div className="prod-card-actions">
                        <button className="icon-button action-view" onClick={() => setDetailItem(t)} title="Inspect Post Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button className="icon-button action-edit" onClick={() => handleOpenEdit(t)} title="Edit Task"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button className="icon-button action-delete" onClick={() => setDeleteTarget(t)} title="Delete Task"
                          style={{ color: '#dc6464' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* MEDIA ASSETS GRID */
              filteredAssets.map(a => {
                const tone = getStatusTone(a.status);
                const isKids = a.platform === 'LoopKids';
                const assetImg = a.image || resolveMediaAssetPicture(a);

                return (
                  <div className="prod-card" key={a.id}>
                    {/* Top Contextual Visual Banner (ProRes camera, Atmos waveform, DCP screen, server racks) */}
                    <div className="prod-card-poster-wrap">
                      <img
                        src={assetImg}
                        alt={a.title}
                        className="prod-card-poster-img"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = resolveMediaAssetPicture(a); }}
                      />
                      <div className="prod-card-poster-gradient" />
                      <div className="prod-card-poster-badges">
                        <span
                          className="badge-tag platform"
                          style={{
                            background: isKids ? 'rgba(239, 195, 72, 0.25)' : 'rgba(38, 30, 15, 0.9)',
                            backdropFilter: 'blur(8px)',
                            border: isKids ? '1px solid #EFC348' : '1px solid #5a4515',
                            color: isKids ? '#F9D558' : '#EFC348',
                            fontWeight: 700
                          }}
                        >
                          {a.platform}
                        </span>
                        <span className={`status-pill ${tone}`} style={{ backdropFilter: 'blur(8px)', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                          {a.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Top */}
                    <div className="prod-card-top">
                      <div className="prod-card-title-group">
                        <div className={`project-icon ${tone}`}>
                          <HardDrive size={20} />
                        </div>
                        <div>
                          <h3 style={{ wordBreak: 'break-all' }}>{a.title}</h3>
                          <span>{a.id} · {a.project}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Tags */}
                    <div className="prod-meta-tags">
                      <span className="badge-tag">{a.assetType}</span>
                      <span className="badge-tag format">{a.codecFormat}</span>
                      <span className="badge-tag">{a.version}</span>
                    </div>

                    {/* Resolution & Checksum */}
                    <p className="prod-synopsis">
                      <strong>Res:</strong> {a.resolution} · <strong>Hash:</strong> {a.checksum || 'sha256: verified'}
                    </p>

                    {/* Storage & Size Overview */}
                    <div className="prod-finance-row">
                      <div className="prod-finance-item">
                        <span>File Payload</span>
                        <strong style={{ color: '#60a5fa' }}>{a.fileSize}</strong>
                      </div>
                      <div className="prod-finance-item">
                        <span>Vault Location</span>
                        <strong style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.storageLocation}
                        </strong>
                      </div>
                    </div>

                    {/* Card Foot */}
                    <div className="prod-card-foot">
                      <div className="prod-foot-crew">
                        <div className="avatar avatar-blue" style={{ width: '28px', height: '28px', fontSize: '9px', background: 'rgba(239, 195, 72, 0.18)', color: '#EFC348', border: '1px solid rgba(239, 195, 72, 0.45)', fontWeight: 750 }}>
                          <Server size={14} />
                        </div>
                        <div>
                          <span>Uploaded By</span>
                          <strong>{a.uploadedBy}</strong>
                        </div>
                      </div>

                      <div className="prod-card-actions">
                        <button className="icon-button action-view" onClick={() => setDetailItem(a)} title="Inspect Asset Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button className="icon-button action-edit" onClick={() => handleOpenEdit(a)} title="Edit Asset"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button className="icon-button action-delete" onClick={() => setDeleteTarget(a)} title="Delete Asset"
                          style={{ color: '#dc6464' }}
                        >
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
            {activeTab === 'pipeline' ? (
              filteredTasks.map(t => {
                const tone = getStatusTone(t.status);
                const postImg = t.image || resolvePostProductionPicture(t);
                return (
                  <div
                    className="prod-list-card"
                    key={t.id}
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
                        <img src={postImg} alt={t.title} className="list-poster-img" loading="lazy" onError={(e) => { e.currentTarget.src = resolvePostProductionPicture(t); }} />
                        <div className="list-poster-overlay">
                          <Cpu size={18} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '15px', color: '#f4f0eb', fontWeight: 750 }}>{t.title}</h3>
                          <span className={`status-pill ${tone}`}>{t.status}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: '#8a96a8' }}>{t.id} · {t.project}</span>
                          <span style={{ fontSize: '11px', color: '#555' }}>•</span>
                          <span className="badge-tag">{t.stage}</span>
                          <span
                            className="badge-tag platform"
                            style={{
                              background: t.platform === 'LoopKids' ? 'rgba(239, 195, 72, 0.2)' : 'rgba(38, 30, 15, 0.9)',
                              border: t.platform === 'LoopKids' ? '1px solid rgba(239, 195, 72, 0.55)' : '1px solid #5a4515',
                              color: t.platform === 'LoopKids' ? '#F9D558' : '#EFC348',
                              fontWeight: 650
                            }}
                          >
                            {t.platform}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ minWidth: '160px', flex: '1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa39d', marginBottom: '5px' }}>
                        <span style={{ color: '#c0b8b1' }}>{t.qcStatus}</span>
                        <strong style={{ color: '#f4f0eb' }}>{t.progress}%</strong>
                      </div>
                      <div className="progress-track" style={{ width: '100%', height: '5px' }}>
                        <div className={`progress-fill ${tone}`} style={{ width: `${t.progress}%` }} />
                      </div>
                    </div>

                    <div style={{ minWidth: '130px', flex: '0.9' }}>
                      <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>SUPERVISOR & FACILITY</span>
                      <strong style={{ fontSize: '13px', color: '#f4f0eb', display: 'block' }}>{t.supervisor}</strong>
                      <span style={{ fontSize: '11px', color: '#8a96a8' }}>{t.facility}</span>
                    </div>

                    <div className="prod-card-actions" style={{ flexShrink: 0 }}>
                      <button className="icon-button action-view" onClick={() => setDetailItem(t)} title="Inspect Post Details">
                        <Eye size={16} />
                      </button>
                      <button className="icon-button action-edit" onClick={() => handleOpenEdit(t)} title="Edit Task">
                        <Edit3 size={16} />
                      </button>
                      <button className="icon-button action-delete" onClick={() => setDeleteTarget(t)} title="Delete Task" style={{ color: '#dc6464' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              filteredAssets.map(a => {
                const tone = getStatusTone(a.status);
                const assetImg = a.image || resolveMediaAssetPicture(a);
                return (
                  <div
                    className="prod-list-card"
                    key={a.id}
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
                        <img src={assetImg} alt={a.title} className="list-poster-img" loading="lazy" onError={(e) => { e.currentTarget.src = resolveMediaAssetPicture(a); }} />
                        <div className="list-poster-overlay">
                          <HardDrive size={18} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '15px', color: '#f4f0eb', fontWeight: 750 }}>{a.title}</h3>
                          <span className={`status-pill ${tone}`}>{a.status}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: '#8a96a8' }}>{a.id} · {a.project}</span>
                          <span style={{ fontSize: '11px', color: '#555' }}>•</span>
                          <span className="badge-tag">{a.assetType}</span>
                          <span
                            className="badge-tag platform"
                            style={{
                              background: a.platform === 'LoopKids' ? 'rgba(239, 195, 72, 0.2)' : 'rgba(38, 30, 15, 0.9)',
                              border: a.platform === 'LoopKids' ? '1px solid rgba(239, 195, 72, 0.55)' : '1px solid #5a4515',
                              color: a.platform === 'LoopKids' ? '#F9D558' : '#EFC348',
                              fontWeight: 650
                            }}
                          >
                            {a.platform}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ minWidth: '130px', flex: '0.8' }}>
                      <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>FORMAT & RES</span>
                      <strong style={{ fontSize: '13px', color: '#60a5fa' }}>{a.codecFormat}</strong>
                      <span style={{ fontSize: '11px', color: '#8a96a8' }}>{a.resolution}</span>
                    </div>

                    <div style={{ minWidth: '130px', flex: '0.8' }}>
                      <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>PAYLOAD & VAULT</span>
                      <strong style={{ fontSize: '13px', color: '#f4f0eb' }}>{a.fileSize}</strong>
                      <span style={{ fontSize: '11px', color: '#8a96a8' }}>{a.storageLocation}</span>
                    </div>

                    <div className="prod-card-actions" style={{ flexShrink: 0 }}>
                      <button className="icon-button action-view" onClick={() => setDetailItem(a)} title="Inspect Asset Details">
                        <Eye size={16} />
                      </button>
                      <button className="icon-button action-edit" onClick={() => handleOpenEdit(a)} title="Edit Asset">
                        <Edit3 size={16} />
                      </button>
                      <button className="icon-button action-delete" onClick={() => setDeleteTarget(a)} title="Delete Asset" style={{ color: '#dc6464' }}>
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
            {activeTab === 'pipeline' ? (
              <table>
                <thead>
                  <tr>
                    <th>TASK & IDENTIFIER</th>
                    <th>PROJECT</th>
                    <th>STAGE</th>
                    <th>SUPERVISOR LAB</th>
                    <th>PROGRESS</th>
                    <th>TARGET DELIVERY</th>
                    <th>DISTRIBUTION</th>
                    <th>QC STATUS</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(t => {
                    const tone = getStatusTone(t.status);
                    const postImg = t.image || resolvePostProductionPicture(t);
                    return (
                      <tr key={t.id}>
                        <td>
                          <div className="project-name" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="table-poster-thumb">
                              <img src={postImg} alt={t.title} className="table-poster-img" loading="lazy" onError={(e) => { e.currentTarget.src = resolvePostProductionPicture(t); }} />
                            </div>
                            <div>
                              <strong>{t.title}</strong>
                              <span>{t.id} · {t.leadArtist}</span>
                            </div>
                          </div>
                        </td>
                        <td><span style={{ fontWeight: 600 }}>{t.project}</span></td>
                        <td><span className="badge-tag">{t.stage}</span></td>
                        <td>
                          <span style={{ color: '#e8e2dc', fontWeight: 600 }}>{t.supervisor}</span>
                          <div style={{ fontSize: '11px', color: '#8a96a8' }}>{t.facility}</div>
                        </td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-track">
                              <div className={`progress-fill ${tone}`} style={{ width: `${t.progress}%` }} />
                            </div>
                            <span>{t.progress}%</span>
                          </div>
                        </td>
                        <td className="date-cell">{t.targetDeliveryDate || 'TBD'}</td>
                        <td>
                          <span
                            className="badge-tag platform"
                            style={{
                              background: t.platform === 'LoopKids' ? 'rgba(239, 195, 72, 0.2)' : 'rgba(38, 30, 15, 0.9)',
                              border: t.platform === 'LoopKids' ? '1px solid rgba(239, 195, 72, 0.55)' : '1px solid #5a4515',
                              color: t.platform === 'LoopKids' ? '#F9D558' : '#EFC348',
                              fontWeight: 650
                            }}
                          >
                            {t.platform}
                          </span>
                        </td>
                        <td><span className={`status-pill ${tone}`}>{t.qcStatus}</span></td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                            <button className="icon-button action-view" onClick={() => setDetailItem(t)} title="Inspect Post Details">
                              <Eye size={16} />
                            </button>
                            <button className="icon-button action-edit" onClick={() => handleOpenEdit(t)} title="Edit Task">
                              <Edit3 size={16} />
                            </button>
                            <button className="icon-button action-delete" onClick={() => setDeleteTarget(t)} title="Delete Task" style={{ color: '#dc6464' }}>
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
                    <th>ASSET FILE & ID</th>
                    <th>PROJECT</th>
                    <th>ASSET TYPE</th>
                    <th>PAYLOAD SIZE</th>
                    <th>CODEC & RESOLUTION</th>
                    <th>VAULT STORAGE</th>
                    <th>DISTRIBUTION</th>
                    <th>QC STATUS</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map(a => {
                    const tone = getStatusTone(a.status);
                    const assetImg = a.image || resolveMediaAssetPicture(a);
                    return (
                      <tr key={a.id}>
                        <td>
                          <div className="project-name" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="table-poster-thumb">
                              <img src={assetImg} alt={a.title} className="table-poster-img" loading="lazy" onError={(e) => { e.currentTarget.src = resolveMediaAssetPicture(a); }} />
                            </div>
                            <div>
                              <strong style={{ wordBreak: 'break-all' }}>{a.title}</strong>
                              <span>{a.id} · {a.version}</span>
                            </div>
                          </div>
                        </td>
                        <td><span style={{ fontWeight: 600 }}>{a.project}</span></td>
                        <td><span className="badge-tag">{a.assetType}</span></td>
                        <td><strong style={{ color: '#60a5fa' }}>{a.fileSize}</strong></td>
                        <td>
                          <span style={{ color: '#e8e2dc', fontWeight: 600 }}>{a.codecFormat}</span>
                          <div style={{ fontSize: '11px', color: '#8a96a8' }}>{a.resolution}</div>
                        </td>
                        <td><span style={{ fontSize: '11.5px', color: '#aaa39d' }}>{a.storageLocation}</span></td>
                        <td>
                          <span
                            className="badge-tag platform"
                            style={{
                              background: a.platform === 'LoopKids' ? 'rgba(239, 195, 72, 0.2)' : 'rgba(38, 30, 15, 0.9)',
                              border: a.platform === 'LoopKids' ? '1px solid rgba(239, 195, 72, 0.55)' : '1px solid #5a4515',
                              color: a.platform === 'LoopKids' ? '#F9D558' : '#EFC348',
                              fontWeight: 650
                            }}
                          >
                            {a.platform}
                          </span>
                        </td>
                        <td><span className={`status-pill ${tone}`}>{a.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                            <button className="icon-button action-view" onClick={() => setDetailItem(a)} title="Inspect Asset Details">
                              <Eye size={16} />
                            </button>
                            <button className="icon-button action-edit" onClick={() => handleOpenEdit(a)} title="Edit Asset">
                              <Edit3 size={16} />
                            </button>
                            <button className="icon-button action-delete" onClick={() => setDeleteTarget(a)} title="Delete Asset" style={{ color: '#dc6464' }}>
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
        {((activeTab === 'pipeline' && filteredTasks.length === 0) || (activeTab === 'vault' && filteredAssets.length === 0)) && (
          <div className="empty-state">
            <Cpu size={36} style={{ color: '#EFC348', margin: '0 auto 12px', display: 'block', opacity: 0.8 }} />
            <strong style={{ display: 'block', color: '#f4f0eb', fontSize: '14px', marginBottom: '4px' }}>
              No post-production records found
            </strong>
            <p style={{ margin: 0 }}>Try clearing your search query or connect live records to Spring Boot database.</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={handleOpenCreate}
              >
                <Plus size={16} /> {activeTab === 'pipeline' ? 'Create Post Milestone' : 'Ingest Media Asset'}
              </button>

            </div>

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
                <h2>{activeTab === 'pipeline' ? 'Create New Post-Production Milestone' : 'Ingest Master Media Asset'}</h2>
                <p>
                  {activeTab === 'pipeline'
                    ? 'Register a DI grading pass, Atmos surround sound mix, or VFX composite pipeline.'
                    : 'Ingest high-bitrate ProRes masters, multi-track Atmos stems, or festival DCP bundles.'}
                </p>
              </div>
              <button type="button" className="icon-button" onClick={() => setCreateModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {activeTab === 'pipeline' ? (
              <>
                <div className="form-grid-2">
                  <label>
                    Milestone Title *
                    <input
                      required
                      placeholder="e.g. Dolby Vision Color Grading & DI Master"
                      value={taskFormData.title}
                      onChange={e => setTaskFormData({ ...taskFormData, title: e.target.value })}
                    />
                  </label>
                  <label>
                    Parent Production *
                    <select
                      value={taskFormData.project}
                      onChange={e => setTaskFormData({ ...taskFormData, project: e.target.value })}
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    Stage Classification
                    <select
                      value={taskFormData.stage}
                      onChange={e => setTaskFormData({ ...taskFormData, stage: e.target.value })}
                    >
                      <option>Color Grading (DI)</option>
                      <option>Sound Design & Atmos Mix</option>
                      <option>VFX Compositing</option>
                      <option>Offline Edit</option>
                      <option>QC & Mastering</option>
                    </select>
                  </label>
                  <label>
                    Supervisor Post House
                    <input
                      placeholder="e.g. Red Chillies Color"
                      value={taskFormData.supervisor}
                      onChange={e => setTaskFormData({ ...taskFormData, supervisor: e.target.value })}
                    />
                  </label>
                  <label>
                    Lead Artist
                    <input
                      placeholder="e.g. Makarand Surte"
                      value={taskFormData.leadArtist}
                      onChange={e => setTaskFormData({ ...taskFormData, leadArtist: e.target.value })}
                    />
                  </label>
                </div>

                <div className="form-grid-2">
                  <label>
                    Facility / Studio Suite
                    <input
                      placeholder="e.g. Red Chillies Color Lab, Mumbai"
                      value={taskFormData.facility}
                      onChange={e => setTaskFormData({ ...taskFormData, facility: e.target.value })}
                    />
                  </label>
                  <label>
                    Completion Progress ({taskFormData.progress}%)
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={taskFormData.progress}
                      onChange={e => setTaskFormData({ ...taskFormData, progress: e.target.value })}
                      style={{ height: '38px', accentColor: '#EFC348' }}
                    />
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    Status
                    <select
                      value={taskFormData.status}
                      onChange={e => setTaskFormData({ ...taskFormData, status: e.target.value })}
                    >
                      <option>In Progress</option>
                      <option>Pending Review</option>
                      <option>Approved</option>
                    </select>
                  </label>
                  <label>
                    Target Delivery Date
                    <input
                      type="date"
                      value={taskFormData.targetDeliveryDate}
                      onChange={e => setTaskFormData({ ...taskFormData, targetDeliveryDate: e.target.value })}
                    />
                  </label>
                  <label>
                    Platform Target
                    <select
                      value={taskFormData.platform}
                      onChange={e => setTaskFormData({ ...taskFormData, platform: e.target.value })}
                    >
                      <option value="LoopNexus">LoopNexus</option>
                      <option value="LoopKids">LoopKids</option>
                    </select>
                  </label>
                </div>

                <label>
                  Technical Calibration Notes
                  <textarea
                    rows={3}
                    placeholder="e.g. L*a*b gamut mapping locked for HDR10 and Dolby Vision 4.0 metadata passes."
                    value={taskFormData.notes}
                    onChange={e => setTaskFormData({ ...taskFormData, notes: e.target.value })}
                  />
                </label>

                <MediaImagePicker
                  value={taskFormData.image}
                  onChange={img => setTaskFormData({ ...taskFormData, image: img })}
                  label="Milestone / Project Poster"
                  defaultFallback={resolvePostProductionPicture(taskFormData)}
                  placeholder="Paste project image URL or choose local image file..."
                />
              </>
            ) : (
              <>
                <div className="form-grid-2">
                  <label>
                    Asset Filename / Master Identifier *
                    <input
                      required
                      placeholder="e.g. TLM_S01E01_Master_ProRes4444XQ_v2.4.mov"
                      value={assetFormData.title}
                      onChange={e => setAssetFormData({ ...assetFormData, title: e.target.value })}
                    />
                  </label>
                  <label>
                    Associated Production
                    <select
                      value={assetFormData.project}
                      onChange={e => setAssetFormData({ ...assetFormData, project: e.target.value })}
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    Asset Classification
                    <select
                      value={assetFormData.assetType}
                      onChange={e => setAssetFormData({ ...assetFormData, assetType: e.target.value })}
                    >
                      <option>Master Cut</option>
                      <option>Sound Stems / Atmos</option>
                      <option>DCP / Cinema Master</option>
                      <option>VFX Plate</option>
                      <option>Subtitle / IMF Package</option>
                      <option>Marketing Key Art & Promo</option>
                    </select>
                  </label>
                  <label>
                    Resolution & Master Specs
                    <input
                      placeholder="e.g. 4K UHD (3840x2160)"
                      value={assetFormData.resolution}
                      onChange={e => setAssetFormData({ ...assetFormData, resolution: e.target.value })}
                    />
                  </label>
                  <label>
                    Codec / Format
                    <input
                      placeholder="e.g. Apple ProRes 4444 XQ"
                      value={assetFormData.codecFormat}
                      onChange={e => setAssetFormData({ ...assetFormData, codecFormat: e.target.value })}
                    />
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    File Payload Size
                    <input
                      placeholder="e.g. 312.4 GB"
                      value={assetFormData.fileSize}
                      onChange={e => setAssetFormData({ ...assetFormData, fileSize: e.target.value })}
                    />
                  </label>
                  <label>
                    Storage Vault Location
                    <input
                      placeholder="e.g. Loop Vault - AWS S3 SGP (Hot)"
                      value={assetFormData.storageLocation}
                      onChange={e => setAssetFormData({ ...assetFormData, storageLocation: e.target.value })}
                    />
                  </label>
                  <label>
                    Platform Target
                    <select
                      value={assetFormData.platform}
                      onChange={e => setAssetFormData({ ...assetFormData, platform: e.target.value })}
                    >
                      <option value="LoopNexus">LoopNexus</option>
                      <option value="LoopKids">LoopKids</option>
                    </select>
                  </label>
                </div>

                <MediaImagePicker
                  value={assetFormData.image}
                  onChange={img => setAssetFormData({ ...assetFormData, image: img })}
                  label="Master Media Asset Artwork"
                  defaultFallback={resolveMediaAssetPicture(assetFormData)}
                  placeholder="Paste asset/cover image URL or choose local image file..."
                />
              </>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-light" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {activeTab === 'pipeline' ? 'Save Milestone' : 'Ingest Master Asset'}
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
                <h2>Edit {activeTab === 'pipeline' ? `Post Milestone (${editItem.id})` : `Media Asset (${editItem.id})`}</h2>
                <p>Modify technical specifications, lab assignments, or delivery deadlines.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setEditItem(null)}>
                <X size={18} />
              </button>
            </div>

            {activeTab === 'pipeline' ? (
              <>
                <div className="form-grid-2">
                  <label>
                    Milestone Title
                    <input
                      required
                      value={taskFormData.title}
                      onChange={e => setTaskFormData({ ...taskFormData, title: e.target.value })}
                    />
                  </label>
                  <label>
                    Supervisor Post House
                    <input
                      value={taskFormData.supervisor}
                      onChange={e => setTaskFormData({ ...taskFormData, supervisor: e.target.value })}
                    />
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    Lead Artist
                    <input
                      value={taskFormData.leadArtist}
                      onChange={e => setTaskFormData({ ...taskFormData, leadArtist: e.target.value })}
                    />
                  </label>
                  <label>
                    Facility
                    <input
                      value={taskFormData.facility}
                      onChange={e => setTaskFormData({ ...taskFormData, facility: e.target.value })}
                    />
                  </label>
                  <label>
                    Platform
                    <select
                      value={taskFormData.platform}
                      onChange={e => setTaskFormData({ ...taskFormData, platform: e.target.value })}
                    >
                      <option value="LoopNexus">LoopNexus</option>
                      <option value="LoopKids">LoopKids</option>
                    </select>
                  </label>
                </div>

                <div className="form-grid-2">
                  <label>
                    Completion Progress ({taskFormData.progress}%)
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={taskFormData.progress}
                      onChange={e => setTaskFormData({ ...taskFormData, progress: e.target.value })}
                      style={{ height: '38px', accentColor: '#EFC348' }}
                    />
                  </label>
                  <label>
                    Status
                    <select
                      value={taskFormData.status}
                      onChange={e => setTaskFormData({ ...taskFormData, status: e.target.value })}
                    >
                      <option>In Progress</option>
                      <option>Pending Review</option>
                      <option>Approved</option>
                    </select>
                  </label>
                </div>

                <label>
                  Technical Calibration Notes
                  <textarea
                    rows={3}
                    value={taskFormData.notes}
                    onChange={e => setTaskFormData({ ...taskFormData, notes: e.target.value })}
                  />
                </label>

                <MediaImagePicker
                  value={taskFormData.image}
                  onChange={img => setTaskFormData({ ...taskFormData, image: img })}
                  label="Milestone / Project Poster"
                  defaultFallback={resolvePostProductionPicture(taskFormData)}
                  placeholder="Paste project image URL or choose local image file..."
                />
              </>
            ) : (
              <>
                <div className="form-grid-2">
                  <label>
                    Asset Identifier
                    <input
                      required
                      value={assetFormData.title}
                      onChange={e => setAssetFormData({ ...assetFormData, title: e.target.value })}
                    />
                  </label>
                  <label>
                    Storage Vault Location
                    <input
                      value={assetFormData.storageLocation}
                      onChange={e => setAssetFormData({ ...assetFormData, storageLocation: e.target.value })}
                    />
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    Payload Size
                    <input
                      value={assetFormData.fileSize}
                      onChange={e => setAssetFormData({ ...assetFormData, fileSize: e.target.value })}
                    />
                  </label>
                  <label>
                    Codec
                    <input
                      value={assetFormData.codecFormat}
                      onChange={e => setAssetFormData({ ...assetFormData, codecFormat: e.target.value })}
                    />
                  </label>
                  <label>
                    Platform
                    <select
                      value={assetFormData.platform}
                      onChange={e => setAssetFormData({ ...assetFormData, platform: e.target.value })}
                    >
                      <option value="LoopNexus">LoopNexus</option>
                      <option value="LoopKids">LoopKids</option>
                    </select>
                  </label>
                </div>

                <MediaImagePicker
                  value={assetFormData.image}
                  onChange={img => setAssetFormData({ ...assetFormData, image: img })}
                  label="Master Media Asset Artwork"
                  defaultFallback={resolveMediaAssetPicture(assetFormData)}
                  placeholder="Paste asset/cover image URL or choose local image file..."
                />
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
            {/* Contextual Visual Header (Color console / sound desk / server rack) */}
            <div style={{ position: 'relative', width: '100%', height: '170px', background: '#111', overflow: 'hidden' }}>
              <img
                src={activeTab === 'pipeline' ? (detailItem.image || resolvePostProductionPicture(detailItem)) : (detailItem.image || resolveMediaAssetPicture(detailItem))}
                alt={detailItem.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%', filter: 'brightness(0.75) contrast(1.1)' }}
                onError={(e) => {
                  e.currentTarget.src = activeTab === 'pipeline'
                    ? resolvePostProductionPicture(detailItem)
                    : resolveMediaAssetPicture(detailItem);
                }}
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
                  <div className={`project-icon ${getStatusTone(detailItem.status)}`}>
                    {activeTab === 'pipeline' ? <Cpu size={22} /> : <HardDrive size={22} />}
                  </div>
                  <div>
                    <h2>{detailItem.title}</h2>
                    <p>{detailItem.id} · {detailItem.project} · {activeTab === 'pipeline' ? detailItem.stage : detailItem.assetType}</p>
                  </div>
                </div>
              </div>

              {/* Overview Section */}
              <div className="detail-section">
                <h4>Technical Specifications</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span>Status</span>
                    <strong className={`status-pill ${getStatusTone(detailItem.status)}`}>
                      {detailItem.status}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>Platform</span>
                    <strong
                      className="badge-tag platform"
                      style={{
                        background: detailItem.platform === 'LoopKids' ? 'rgba(239, 195, 72, 0.2)' : 'rgba(38, 30, 15, 0.9)',
                        border: detailItem.platform === 'LoopKids' ? '1px solid rgba(239, 195, 72, 0.55)' : '1px solid #5a4515',
                        color: detailItem.platform === 'LoopKids' ? '#F9D558' : '#EFC348',
                        fontWeight: 650
                      }}
                    >
                      {detailItem.platform}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>{activeTab === 'pipeline' ? 'Supervisor Lab' : 'Payload Size'}</span>
                    <strong>{activeTab === 'pipeline' ? detailItem.supervisor : detailItem.fileSize}</strong>
                  </div>
                  <div className="detail-item">
                    <span>{activeTab === 'pipeline' ? 'Lead Artist' : 'Codec / Format'}</span>
                    <strong>{activeTab === 'pipeline' ? detailItem.leadArtist : detailItem.codecFormat}</strong>
                  </div>
                </div>
              </div>

              {/* Notes / Calibration */}
              {activeTab === 'pipeline' && (
                <div className="detail-section">
                  <h4>Calibration & Review Notes</h4>
                  <p style={{ fontSize: '13px', color: '#c6bdb5', lineHeight: '1.6', margin: 0 }}>
                    {detailItem.notes || 'No calibration notes recorded.'}
                  </p>
                </div>
              )}

              {/* Checksum / Vault for assets */}
              {activeTab === 'vault' && (
                <div className="detail-section">
                  <h4 style={{ color: '#EFC348' }}>Cloud Storage Integrity</h4>
                  <p style={{ fontSize: '12.5px', color: '#8a96a8', margin: '0 0 8px' }}>
                    Vault: <strong style={{ color: '#f4f0eb' }}>{detailItem.storageLocation}</strong>
                  </p>
                  <p style={{ fontSize: '12px', color: '#67d7a3', fontFamily: 'monospace', margin: 0 }}>
                    Checksum: {detailItem.checksum}
                  </p>
                </div>
              )}

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
                <strong style={{ color: '#fff' }}>{deleteTarget.title}</strong> ({deleteTarget.id})? All associated post-production pipeline logs will be removed.
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
