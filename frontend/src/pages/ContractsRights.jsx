import { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Scale,
  ShieldCheck,
  Globe,
  Building,
  Download,
  Plus,
  Search,
  LayoutGrid,
  List,
  Table as TableIcon,
  Edit3,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
  FileCheck,
  Calendar,
  DollarSign,
  Briefcase,
  RefreshCw,
  Loader2
} from 'lucide-react';
import {
  contractApi,
  contentRightApi,
  extractPageItems,
  normalizeContractStatusToBackend,
  normalizeContractStatusToFrontend,
  normalizeRightsStatusToBackend,
  normalizeRightsStatusToFrontend
} from '../api/mediaAudioLegalApi.js';
import {
  resolveContractPicture,
  resolveContentRightPicture
} from '../utils/mediaAudioLegalImages.js';
import MediaImagePicker from '../components/MediaImagePicker.jsx';
import {
  getStoredProjects,
  formatCurrency,
  normalizeLoopPlatform,
  getStoredContracts,
  saveContracts,
  createContract,
  updateContract,
  deleteContract,
  getStoredRights,
  saveRights,
  createRight,
  updateRight,
  deleteRight,
} from '../utils/productionStorage.js';

export default function ContractsRights() {
  const [projects] = useState(() => getStoredProjects());
  const [activeTab, setActiveTab] = useState('contracts'); // 'contracts' | 'rights'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'table'

  // Data states
  const [contracts, setContracts] = useState([]);
  const [rights, setRights] = useState([]);

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
      const [contractsRes, rightsRes] = await Promise.all([
        contractApi.list({ size: 100 }),
        contentRightApi.list({ size: 100 })
      ]);

      const items = extractPageItems(contractsRes);
      if (items.length > 0) {
        const mapped = items.map(item => ({
        id: item.id,
        title: item.name || 'Production Agreement',
        project: item.projectRef || 'General',
        counterparty: item.partyTwo || item.partyOne || 'Counterparty',
        agreementType: item.contractType || 'Talent / Cast Agreement',
        contractValue: item.contractValue || 5000000,
        paymentTerms: item.notes || '30% Signing · 40% Wrap · 30% Delivery',
        effectiveDate: item.startsAt ? item.startsAt.slice(0, 10) : new Date().toISOString().split('T')[0],
        expiryDate: item.endsAt ? item.endsAt.slice(0, 10) : '2028-12-31',
        status: item.status === 'ACTIVE' ? 'Executed / Signed' : item.status === 'PENDING' ? 'Pending Review' : (normalizeContractStatusToFrontend(item.status) || 'Executed / Signed'),
        legalSignatory: item.partyOne || 'Studio North Legal & Counterparty',
        governingLaw: item.governingLaw || 'High Court of Bombay, Mumbai',
        platform: item.platform || 'LoopNexus',
        image: item.image || resolveContractPicture(item)
      }));
        setContracts(mapped);
      } else {
        setContracts([]);
      }

      const rightItems = extractPageItems(rightsRes);
      if (rightItems.length > 0) {
        const mappedRights = rightItems.map(item => ({
        id: item.id,
        title: item.name || 'Digital Streaming Rights',
        project: item.projectRef || 'General',
        territory: item.territory || 'Worldwide',
        rightsType: item.rightsType || 'SVOD / OTT Subscription',
        exclusivity: item.exclusive ? 'Exclusive' : 'Non-Exclusive',
        rightsPeriod: item.rightsPeriod || '5 Years',
        startDate: item.startsAt ? item.startsAt.slice(0, 10) : new Date().toISOString().split('T')[0],
        endDate: item.endsAt ? item.endsAt.slice(0, 10) : '2031-12-31',
        platform: item.platforms ? item.platforms.split(',')[0].trim() : 'LoopNexus',
        licenseFee: item.licenseFee || 50000000,
        revenueSharePct: item.revenueSharePct || '0% (Flat License)',
        status: normalizeRightsStatusToFrontend(item.status),
        restrictions: item.restrictions || 'Standard holdback windows apply',
        image: item.image || resolveContentRightPicture(item)
      }));
        setRights(mappedRights);
      } else {
        setRights([]);
      }
    } catch (err) {
      console.warn('Backend fetch error in ContractsRights:', err);
      setApiError(err.message || 'Could not connect to live backend.');
      setContracts(getStoredContracts());
      setRights(getStoredContentRights());
    } finally {
      setLoading(false);
    }
  };

  const handleSeedBackend = async () => {
    setIsSubmitting(true);
    try {
      showToast('Seeding initial contracts to Spring Boot backend database...', 'info');
      const sampleContracts = [
        { name: 'Lead Actor Engagement Agreement', description: 'Talent Agreement', projectRef: 'The Last Monsoon', contractType: 'Talent / Cast Agreement', partyOne: 'Studio North Legal', partyTwo: 'Ranbir Kapoor / Matrix Talent', status: 'ACTIVE', startsAt: '2026-08-01', endsAt: '2028-12-31', documentReference: 'doc://legal/vault/contract-101.pdf', notes: '30% Signing · 40% Wrap · 30% Delivery', active: true },
        { name: 'Principal Director Long-Form Service Agreement', description: 'Director Agreement', projectRef: 'City of Echoes', contractType: 'Director Service Agreement', partyOne: 'Studio North Legal', partyTwo: 'Vikramaditya Motwane', status: 'ACTIVE', startsAt: '2026-06-01', endsAt: '2029-06-01', documentReference: 'doc://legal/vault/contract-102.pdf', notes: 'Standard director terms', active: true }
      ];
      for (const c of sampleContracts) {
        await contractApi.create(c).catch(() => {});
      }
      await fetchBackendData();
      showToast('Contracts seeded into backend database successfully!');
    } catch (e) {
      showToast('Failed to seed contracts: ' + e.message, 'error');
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
  const [agreementTypeFilter, setAgreementTypeFilter] = useState('ALL');
  const [rightsTypeFilter, setRightsTypeFilter] = useState('ALL');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form states
  const initialContractForm = {
    project: projects[0]?.name || 'The Last Monsoon',
    title: '',
    counterparty: '',
    agreementType: 'Talent / Cast Agreement',
    contractValue: 5000000,
    paymentTerms: '30% Signing · 40% Wrap · 30% Delivery',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '2028-12-31',
    status: 'Executed / Signed',
    legalSignatory: 'Studio North Legal & Counterparty',
    governingLaw: 'High Court of Bombay, Mumbai',
    fileAttachment: '',
    platform: 'LoopNexus',
    image: ''
  };

  const initialRightForm = {
    project: projects[0]?.name || 'The Last Monsoon',
    title: '',
    territory: 'Worldwide',
    rightsType: 'SVOD / OTT Subscription',
    exclusivity: 'Exclusive',
    rightsPeriod: '5 Years',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2031-12-31',
    platform: 'LoopNexus',
    licenseFee: 50000000,
    revenueSharePct: '0% (Flat License)',
    status: 'Active',
    restrictions: 'Standard holdback windows apply',
    image: ''
  };

  const [contractFormData, setContractFormData] = useState(initialContractForm);
  const [rightFormData, setRightFormData] = useState(initialRightForm);

  // KPI Metrics
  const totalContractsCount = contracts.length;
  const executedContractsCount = contracts.filter(c => c.status === 'Executed / Signed').length;
  const totalRightsCount = rights.length;
  const activeRightsCount = rights.filter(r => r.status === 'Active').length;

  const totalContractSpend = useMemo(() => {
    return contracts.reduce((acc, c) => acc + (Number(c.contractValue) || 0), 0);
  }, [contracts]);

  const totalRightsValue = useMemo(() => {
    return rights.reduce((acc, r) => acc + (Number(r.licenseFee) || 0), 0);
  }, [rights]);

  // Tone mapping helper
  const getStatusTone = (status) => {
    switch (status) {
      case 'Executed / Signed':
      case 'Active':
        return 'green';
      case 'In Negotiation':
      case 'Reserved':
        return 'orange';
      case 'Under Legal Review':
      case 'Licensed':
        return 'blue';
      case 'Expired':
      case 'Terminated':
        return 'red';
      default:
        return 'blue';
    }
  };

  // Filtered Contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(item => {
      if (platformFilter !== 'ALL' && item.platform.toLowerCase() !== platformFilter.toLowerCase()) {
        return false;
      }
      if (agreementTypeFilter !== 'ALL' && item.agreementType !== agreementTypeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchProject = item.project?.toLowerCase().includes(q);
        const matchCounterparty = item.counterparty?.toLowerCase().includes(q);
        const matchType = item.agreementType?.toLowerCase().includes(q);
        const matchSignatory = item.legalSignatory?.toLowerCase().includes(q);
        const matchId = item.id?.toLowerCase().includes(q);
        return matchTitle || matchProject || matchCounterparty || matchType || matchSignatory || matchId;
      }
      return true;
    });
  }, [contracts, platformFilter, agreementTypeFilter, searchQuery]);

  // Filtered Rights
  const filteredRights = useMemo(() => {
    return rights.filter(item => {
      if (platformFilter !== 'ALL' && item.platform.toLowerCase() !== platformFilter.toLowerCase()) {
        return false;
      }
      if (rightsTypeFilter !== 'ALL' && item.rightsType !== rightsTypeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchProject = item.project?.toLowerCase().includes(q);
        const matchTerritory = item.territory?.toLowerCase().includes(q);
        const matchType = item.rightsType?.toLowerCase().includes(q);
        const matchExclusivity = item.exclusivity?.toLowerCase().includes(q);
        const matchId = item.id?.toLowerCase().includes(q);
        return matchTitle || matchProject || matchTerritory || matchType || matchExclusivity || matchId;
      }
      return true;
    });
  }, [rights, platformFilter, rightsTypeFilter, searchQuery]);

  // Open Create
  const handleOpenCreate = () => {
    if (activeTab === 'contracts') {
      setContractFormData({
        ...initialContractForm,
        project: projects[0]?.name || 'The Last Monsoon',
        effectiveDate: new Date().toISOString().split('T')[0]
      });
    } else {
      setRightFormData({
        ...initialRightForm,
        project: projects[0]?.name || 'The Last Monsoon',
        startDate: new Date().toISOString().split('T')[0]
      });
    }
    setCreateModalOpen(true);
  };

  // Submit Create
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeTab === 'contracts') {
        if (!contractFormData.title.trim()) return;
        const payload = {
          name: contractFormData.title.trim(),
          description: contractFormData.agreementType || 'Legal Agreement',
          projectRef: contractFormData.project,
          contractType: contractFormData.agreementType || 'Talent / Cast Agreement',
          partyOne: contractFormData.legalSignatory || 'Studio North Legal',
          partyTwo: contractFormData.counterparty || 'Counterparty',
          mediaId: null,
          status: normalizeContractStatusToBackend(contractFormData.status),
          startsAt: contractFormData.effectiveDate || new Date().toISOString().split('T')[0],
          endsAt: contractFormData.expiryDate || '2028-12-31',
          renewalAt: null,
          documentReference: contractFormData.fileAttachment || 'doc://legal/vault/contract.pdf',
          notes: contractFormData.paymentTerms || '',
          active: true
        };

        try {
          const created = await contractApi.create(payload);
          const mappedNew = {
            ...contractFormData,
            id: created.id,
            title: created.name || contractFormData.title,
            image: contractFormData.image || resolveContractPicture(created)
          };
          setContracts(prev => [mappedNew, ...prev]);
          saveContracts([mappedNew, ...getStoredContracts()]);
          showToast('Legal contract registered on backend successfully!');
        } catch (apiErr) {
          console.warn('Backend create failed, storing locally:', apiErr);
          const { all } = createContract(contractFormData);
          setContracts(all);
          showToast('Contract saved locally.', 'info');
        }
      } else {
        if (!rightFormData.title.trim()) return;
        const contractRefId = typeof contracts[0]?.id === 'number' ? contracts[0].id : null;

        const payload = {
          name: rightFormData.title.trim(),
          description: rightFormData.rightsType || 'Content Distribution Rights',
          projectRef: rightFormData.project,
          rightsType: rightFormData.rightsType || 'SVOD / OTT Subscription',
          mediaId: 1,
          contractId: contractRefId,
          territory: rightFormData.territory || 'Worldwide',
          platforms: rightFormData.platform || 'LoopNexus, LoopKids',
          languages: 'Hindi, Tamil, Telugu, English',
          exclusive: rightFormData.exclusivity?.toLowerCase() !== 'non-exclusive',
          startsAt: rightFormData.startDate || new Date().toISOString().split('T')[0],
          endsAt: rightFormData.endDate || '2031-12-31',
          restrictions: rightFormData.restrictions || '',
          status: normalizeRightsStatusToBackend(rightFormData.status),
          active: true
        };

        try {
          const created = await contentRightApi.create(payload);
          const mappedNew = {
            ...rightFormData,
            id: created.id,
            title: created.name || rightFormData.title,
            image: rightFormData.image || resolveContentRightPicture(created)
          };
          setRights(prev => [mappedNew, ...prev]);
          saveContentRights([mappedNew, ...getStoredContentRights()]);
          showToast('Content rights license registered on backend successfully!');
        } catch (apiErr) {
          console.warn('Backend create failed, storing locally:', apiErr);
          const { all } = createRight(rightFormData);
          setRights(all);
          showToast('Content rights saved locally.', 'info');
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
    if (activeTab === 'contracts') {
      setContractFormData({
        project: item.project,
        title: item.title,
        counterparty: item.counterparty,
        agreementType: item.agreementType,
        contractValue: item.contractValue,
        paymentTerms: item.paymentTerms,
        effectiveDate: item.effectiveDate,
        expiryDate: item.expiryDate || '',
        status: item.status,
        legalSignatory: item.legalSignatory,
        governingLaw: item.governingLaw,
        fileAttachment: item.fileAttachment || '',
        platform: item.platform,
        image: item.image || ''
      });
    } else {
      setRightFormData({
        project: item.project,
        title: item.title,
        territory: item.territory,
        rightsType: item.rightsType,
        exclusivity: item.exclusivity,
        rightsPeriod: item.rightsPeriod,
        startDate: item.startDate,
        endDate: item.endDate || '',
        platform: item.platform,
        licenseFee: item.licenseFee,
        revenueSharePct: item.revenueSharePct,
        status: item.status,
        restrictions: item.restrictions || '',
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

      if (activeTab === 'contracts') {
        const payload = {
          name: contractFormData.title.trim(),
          description: contractFormData.agreementType || 'Legal Agreement',
          projectRef: contractFormData.project,
          contractType: contractFormData.agreementType || 'Talent / Cast Agreement',
          partyOne: contractFormData.legalSignatory || 'Studio North Legal',
          partyTwo: contractFormData.counterparty || 'Counterparty',
          mediaId: null,
          status: normalizeContractStatusToBackend(contractFormData.status),
          startsAt: contractFormData.effectiveDate || new Date().toISOString().split('T')[0],
          endsAt: contractFormData.expiryDate || '2028-12-31',
          renewalAt: null,
          documentReference: contractFormData.fileAttachment || 'doc://legal/vault/contract.pdf',
          notes: contractFormData.paymentTerms || '',
          active: true
        };

        if (isNumericId) {
          try {
            await contractApi.update(editItem.id, payload);
            setContracts(prev => prev.map(c => (c.id === editItem.id ? { ...c, ...contractFormData } : c)));
            showToast('Legal contract updated successfully on backend!');
          } catch (apiErr) {
            console.warn('Backend update failed, updating locally:', apiErr);
            const updated = updateContract(editItem.id, contractFormData);
            setContracts(updated);
            showToast('Contract updated locally.', 'info');
          }
        } else {
          const updated = updateContract(editItem.id, contractFormData);
          setContracts(updated);
          showToast('Contract updated locally.');
        }
      } else {
        const contractRefId = typeof contracts[0]?.id === 'number' ? contracts[0].id : null;
        const payload = {
          name: rightFormData.title.trim(),
          description: rightFormData.rightsType || 'Content Distribution Rights',
          projectRef: rightFormData.project,
          rightsType: rightFormData.rightsType || 'SVOD / OTT Subscription',
          mediaId: 1,
          contractId: contractRefId,
          territory: rightFormData.territory || 'Worldwide',
          platforms: rightFormData.platform || 'LoopNexus, LoopKids',
          languages: 'Hindi, Tamil, Telugu, English',
          exclusive: rightFormData.exclusivity?.toLowerCase() !== 'non-exclusive',
          startsAt: rightFormData.startDate || new Date().toISOString().split('T')[0],
          endsAt: rightFormData.endDate || '2031-12-31',
          restrictions: rightFormData.restrictions || '',
          status: normalizeRightsStatusToBackend(rightFormData.status),
          active: true
        };

        if (isNumericId) {
          try {
            await contentRightApi.update(editItem.id, payload);
            setRights(prev => prev.map(r => (r.id === editItem.id ? { ...r, ...rightFormData } : r)));
            showToast('Content rights updated successfully on backend!');
          } catch (apiErr) {
            console.warn('Backend update failed, updating locally:', apiErr);
            const updated = updateRight(editItem.id, rightFormData);
            setRights(updated);
            showToast('Content rights updated locally.', 'info');
          }
        } else {
          const updated = updateRight(editItem.id, rightFormData);
          setRights(updated);
          showToast('Content rights updated locally.');
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

      if (activeTab === 'contracts') {
        if (isNumericId) {
          try {
            await contractApi.delete(deleteTarget.id);
            setContracts(prev => prev.filter(c => c.id !== deleteTarget.id));
            showToast('Contract deleted from backend.');
          } catch (apiErr) {
            console.warn('Backend delete failed, removing locally:', apiErr);
            const updated = deleteContract(deleteTarget.id);
            setContracts(updated);
            showToast('Contract removed locally.', 'info');
          }
        } else {
          const updated = deleteContract(deleteTarget.id);
          setContracts(updated);
          showToast('Contract deleted successfully.');
        }
      } else {
        if (isNumericId) {
          try {
            await contentRightApi.delete(deleteTarget.id);
            setRights(prev => prev.filter(r => r.id !== deleteTarget.id));
            showToast('Content right deleted from backend.');
          } catch (apiErr) {
            console.warn('Backend delete failed, removing locally:', apiErr);
            const updated = deleteRight(deleteTarget.id);
            setRights(updated);
            showToast('Content right removed locally.', 'info');
          }
        } else {
          const updated = deleteRight(deleteTarget.id);
          setRights(updated);
          showToast('Content right deleted successfully.');
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
          <h1>Contracts & Rights Management</h1>
          <p>
            Oversee legal talent pacts, showrunner director agreements, music synchronization, territorial rights, and holdback windows.
          </p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} /> {activeTab === 'contracts' ? 'New Legal Contract' : 'Register Content Right'}
          </button>
        </div>
      </div>

      {/* Mini Stats KPI */}
      <div className="mini-stats">
        <div className="mini-stat">
          <span>Active Contracts</span>
          <strong>{totalContractsCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Rights Portfolio</span>
          <strong style={{ color: '#f07842' }}>{totalRightsCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Executed / Signed</span>
          <strong style={{ color: '#67d7a3' }}>{executedContractsCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Contract Commitments</span>
          <strong>{formatCurrency(totalContractSpend)}</strong>
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
              className={activeTab === 'contracts' ? 'chosen' : ''}
              onClick={() => setActiveTab('contracts')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 15px', fontSize: '12px' }}
            >
              <FileText size={16} /> Legal Contracts & Agreements
            </button>
            <button
              type="button"
              className={activeTab === 'rights' ? 'chosen' : ''}
              onClick={() => setActiveTab('rights')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 15px', fontSize: '12px' }}
            >
              <Globe size={16} /> Content Rights & Territories
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
                placeholder={activeTab === 'contracts' ? 'Search contracts, counterparties...' : 'Search rights, territories, terms...'}
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

          {/* Secondary Agreement Type or Rights Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8a96a8', letterSpacing: '1px' }}>
              {activeTab === 'contracts' ? 'AGREEMENT TYPE:' : 'RIGHTS TYPE:'}
            </span>
            <div className="filter-tabs">
              {activeTab === 'contracts' ? (
                ['ALL', 'Talent / Cast Agreement', 'Director Service Contract', 'Music Synchronization License', 'Crew NDA & Work-for-Hire', 'OTT Platform Distribution Agreement'].map(st => (
                  <button
                    key={st}
                    type="button"
                    className={`filter-tab-pill ${agreementTypeFilter.toLowerCase() === st.toLowerCase() ? 'active' : ''}`}
                    onClick={() => setAgreementTypeFilter(st)}
                  >
                    {st === 'ALL' ? 'All Agreement Types' : st}
                  </button>
                ))
              ) : (
                ['ALL', 'SVOD / OTT Subscription', 'Theatrical Exhibition', 'Linear Satellite Broadcast', 'In-Flight / Maritime', 'SVOD / Educational & Institutional'].map(rt => (
                  <button
                    key={rt}
                    type="button"
                    className={`filter-tab-pill ${rightsTypeFilter.toLowerCase() === rt.toLowerCase() ? 'active' : ''}`}
                    onClick={() => setRightsTypeFilter(rt)}
                  >
                    {rt === 'ALL' ? 'All Rights Types' : rt}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ================= CARD GRID VIEW ================= */}
        {viewMode === 'grid' && (
          <div className="production-grid">
            {activeTab === 'contracts' ? (
              filteredContracts.map(c => {
                const tone = getStatusTone(c.status);
                const isKids = c.platform === 'LoopKids';
                const contractImg = c.image || resolveContractPicture(c);

                return (
                  <div className="prod-card" key={c.id}>
                    {/* Top Contextual Visual Banner (Executive legal parchment, contract deed, fountain pen) */}
                    <div className="prod-card-poster-wrap">
                      <img
                        src={contractImg}
                        alt={c.title}
                        className="prod-card-poster-img"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = resolveContractPicture(c); }}
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
                          {c.platform}
                        </span>
                        <span className={`status-pill ${tone}`} style={{ backdropFilter: 'blur(8px)', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                          {c.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Top */}
                    <div className="prod-card-top">
                      <div className="prod-card-title-group">
                        <div className={`project-icon ${tone}`}>
                          <Scale size={20} />
                        </div>
                        <div>
                          <h3>{c.title}</h3>
                          <span>{c.id} · {c.project}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Tags */}
                    <div className="prod-meta-tags">
                      <span className="badge-tag">{c.agreementType}</span>
                      <span className="badge-tag format">{c.counterparty}</span>
                      <span className="badge-tag" style={{ color: '#67d7a3', borderColor: '#2d4a3b' }}>
                        {c.governingLaw?.split(',')[0]}
                      </span>
                    </div>

                    {/* Payment Tranches */}
                    <p className="prod-synopsis">
                      <strong>Payment Terms:</strong> {c.paymentTerms}
                    </p>

                    {/* Financial Commitment Overview */}
                    <div className="prod-finance-row">
                      <div className="prod-finance-item">
                        <span>Contract Value</span>
                        <strong style={{ color: '#10b981' }}>{formatCurrency(c.contractValue)}</strong>
                      </div>
                      <div className="prod-finance-item">
                        <span>Effective Window</span>
                        <strong style={{ color: '#f07842', fontSize: '11px' }}>
                          {c.effectiveDate} to {c.expiryDate || 'N/A'}
                        </strong>
                      </div>
                    </div>

                    {/* Card Foot */}
                    <div className="prod-card-foot">
                      <div className="prod-foot-crew">
                        <div className="avatar avatar-blue" style={{ width: '28px', height: '28px', fontSize: '9px' }}>
                          <FileCheck size={14} />
                        </div>
                        <div>
                          <span>Legal Signatory</span>
                          <strong style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.legalSignatory}
                          </strong>
                        </div>
                      </div>

                      <div className="prod-card-actions">
                        <button className="icon-button" onClick={() => setDetailItem(c)} title="Inspect Contract Dossier">
                          <Eye size={16} />
                        </button>
                        <button className="icon-button" onClick={() => handleOpenEdit(c)} title="Edit Contract">
                          <Edit3 size={16} />
                        </button>
                        <button className="icon-button" onClick={() => setDeleteTarget(c)} title="Delete Contract" style={{ color: '#dc6464' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* CONTENT RIGHTS GRID */
              filteredRights.map(r => {
                const tone = getStatusTone(r.status);
                const isKids = r.platform === 'LoopKids';
                const rightImg = r.image || resolveContentRightPicture(r);

                return (
                  <div className="prod-card" key={r.id}>
                    {/* Top Contextual Visual Banner (Global territory map, IMAX theater, satellite transmission) */}
                    <div className="prod-card-poster-wrap">
                      <img
                        src={rightImg}
                        alt={r.title}
                        className="prod-card-poster-img"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = resolveContentRightPicture(r); }}
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
                          {r.platform}
                        </span>
                        <span className={`status-pill ${tone}`} style={{ backdropFilter: 'blur(8px)', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                          {r.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Top */}
                    <div className="prod-card-top">
                      <div className="prod-card-title-group">
                        <div className={`project-icon ${tone}`}>
                          <Globe size={20} />
                        </div>
                        <div>
                          <h3>{r.title}</h3>
                          <span>{r.id} · {r.project}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Tags */}
                    <div className="prod-meta-tags">
                      <span className="badge-tag">{r.rightsType}</span>
                      <span className="badge-tag format">{r.territory}</span>
                      <span className="badge-tag" style={{ color: '#67d7a3', borderColor: '#2d4a3b' }}>
                        {r.exclusivity} ({r.rightsPeriod})
                      </span>
                    </div>

                    {/* Holdback Restrictions */}
                    <p className="prod-synopsis">
                      <strong>Holdback:</strong> {r.restrictions}
                    </p>

                    {/* Valuation & Royalty Overview */}
                    <div className="prod-finance-row">
                      <div className="prod-finance-item">
                        <span>License Valuation</span>
                        <strong style={{ color: '#10b981' }}>{formatCurrency(r.licenseFee)}</strong>
                      </div>
                      <div className="prod-finance-item">
                        <span>Backend Share</span>
                        <strong style={{ color: '#a78bfa' }}>{r.revenueSharePct}</strong>
                      </div>
                    </div>

                    {/* Card Foot */}
                    <div className="prod-card-foot">
                      <div className="prod-foot-crew">
                        <div className="avatar avatar-blue" style={{ width: '28px', height: '28px', fontSize: '9px' }}>
                          <Globe size={14} />
                        </div>
                        <div>
                          <span>Licensed Territory</span>
                          <strong style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.territory}
                          </strong>
                        </div>
                      </div>

                      <div className="prod-card-actions">
                        <button className="icon-button" onClick={() => setDetailItem(r)} title="Inspect Rights Clearance">
                          <Eye size={16} />
                        </button>
                        <button className="icon-button" onClick={() => handleOpenEdit(r)} title="Edit Content Right">
                          <Edit3 size={16} />
                        </button>
                        <button className="icon-button" onClick={() => setDeleteTarget(r)} title="Delete Content Right" style={{ color: '#dc6464' }}>
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
            {activeTab === 'contracts' ? (
              filteredContracts.map(c => {
                const tone = getStatusTone(c.status);
                const contractImg = c.image || resolveContractPicture(c);
                return (
                  <div
                    className="prod-list-card"
                    key={c.id}
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
                        <img src={contractImg} alt={c.title} className="list-poster-img" loading="lazy" onError={(e) => { e.currentTarget.src = resolveContractPicture(c); }} />
                        <div className="list-poster-overlay">
                          <Scale size={18} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '15px', color: '#f4f0eb', fontWeight: 750 }}>{c.title}</h3>
                          <span className={`status-pill ${tone}`}>{c.status}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: '#8a96a8' }}>{c.id} · {c.project}</span>
                          <span style={{ fontSize: '11px', color: '#555' }}>•</span>
                          <span className="badge-tag">{c.agreementType}</span>
                          <span
                            className="badge-tag platform"
                            style={{
                              background: c.platform === 'LoopKids' ? 'rgba(234, 179, 8, 0.2)' : '#2a1c16',
                              border: c.platform === 'LoopKids' ? '1px solid rgba(234, 179, 8, 0.55)' : '1px solid #4a2b1b',
                              color: c.platform === 'LoopKids' ? '#facc15' : '#f07842',
                              fontWeight: 650
                            }}
                          >
                            {c.platform}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ minWidth: '130px', flex: '0.8' }}>
                      <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>COUNTERPARTY</span>
                      <strong style={{ fontSize: '13px', color: '#f4f0eb', display: 'block' }}>{c.counterparty}</strong>
                      <span style={{ fontSize: '11px', color: '#8a96a8' }}>{c.governingLaw?.split(',')[0]}</span>
                    </div>

                    <div style={{ minWidth: '130px', flex: '0.8' }}>
                      <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>CONTRACT VALUE</span>
                      <strong style={{ fontSize: '13px', color: '#10b981' }}>{formatCurrency(c.contractValue)}</strong>
                      <span style={{ fontSize: '11px', color: '#8a96a8' }}>Exp: {c.expiryDate || 'N/A'}</span>
                    </div>

                    <div className="prod-card-actions" style={{ flexShrink: 0 }}>
                      <button className="icon-button" onClick={() => setDetailItem(c)} title="Inspect Contract Dossier">
                        <Eye size={16} />
                      </button>
                      <button className="icon-button" onClick={() => handleOpenEdit(c)} title="Edit Contract">
                        <Edit3 size={16} />
                      </button>
                      <button className="icon-button" onClick={() => setDeleteTarget(c)} title="Delete Contract" style={{ color: '#dc6464' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              filteredRights.map(r => {
                const tone = getStatusTone(r.status);
                const rightImg = r.image || resolveContentRightPicture(r);
                return (
                  <div
                    className="prod-list-card"
                    key={r.id}
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
                        <img src={rightImg} alt={r.title} className="list-poster-img" loading="lazy" onError={(e) => { e.currentTarget.src = resolveContentRightPicture(r); }} />
                        <div className="list-poster-overlay">
                          <Globe size={18} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '15px', color: '#f4f0eb', fontWeight: 750 }}>{r.title}</h3>
                          <span className={`status-pill ${tone}`}>{r.status}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: '#8a96a8' }}>{r.id} · {r.territory}</span>
                          <span style={{ fontSize: '11px', color: '#555' }}>•</span>
                          <span className="badge-tag">{r.rightsType}</span>
                          <span
                            className="badge-tag platform"
                            style={{
                              background: r.platform === 'LoopKids' ? 'rgba(234, 179, 8, 0.2)' : '#2a1c16',
                              border: r.platform === 'LoopKids' ? '1px solid rgba(234, 179, 8, 0.55)' : '1px solid #4a2b1b',
                              color: r.platform === 'LoopKids' ? '#facc15' : '#f07842',
                              fontWeight: 650
                            }}
                          >
                            {r.platform}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ minWidth: '130px', flex: '0.8' }}>
                      <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>EXCLUSIVITY & TERM</span>
                      <strong style={{ fontSize: '13px', color: '#f4f0eb', display: 'block' }}>{r.exclusivity}</strong>
                      <span style={{ fontSize: '11px', color: '#8a96a8' }}>{r.rightsPeriod}</span>
                    </div>

                    <div style={{ minWidth: '130px', flex: '0.8' }}>
                      <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>LICENSE VALUATION</span>
                      <strong style={{ fontSize: '13px', color: '#10b981' }}>{formatCurrency(r.licenseFee)}</strong>
                      <span style={{ fontSize: '11px', color: '#a78bfa' }}>Split: {r.revenueSharePct}</span>
                    </div>

                    <div className="prod-card-actions" style={{ flexShrink: 0 }}>
                      <button className="icon-button" onClick={() => setDetailItem(r)} title="Inspect Rights Clearance">
                        <Eye size={16} />
                      </button>
                      <button className="icon-button" onClick={() => handleOpenEdit(r)} title="Edit Content Right">
                        <Edit3 size={16} />
                      </button>
                      <button className="icon-button" onClick={() => setDeleteTarget(r)} title="Delete Content Right" style={{ color: '#dc6464' }}>
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
            {activeTab === 'contracts' ? (
              <table>
                <thead>
                  <tr>
                    <th>CONTRACT & TITLE</th>
                    <th>PROJECT</th>
                    <th>COUNTERPARTY</th>
                    <th>AGREEMENT TYPE</th>
                    <th>CONTRACT VALUE</th>
                    <th>EXPIRY DATE</th>
                    <th>DISTRIBUTION</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map(c => {
                    const tone = getStatusTone(c.status);
                    const contractImg = c.image || resolveContractPicture(c);
                    return (
                      <tr key={c.id}>
                        <td>
                          <div className="project-name" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="table-poster-thumb">
                              <img src={contractImg} alt={c.title} className="table-poster-img" loading="lazy" onError={(e) => { e.currentTarget.src = resolveContractPicture(c); }} />
                            </div>
                            <div>
                              <strong>{c.title}</strong>
                              <span>{c.id} · Eff: {c.effectiveDate}</span>
                            </div>
                          </div>
                        </td>
                        <td><span style={{ fontWeight: 600 }}>{c.project}</span></td>
                        <td><span style={{ color: '#f4f0eb', fontWeight: 650 }}>{c.counterparty}</span></td>
                        <td><span className="badge-tag">{c.agreementType}</span></td>
                        <td><strong style={{ color: '#10b981' }}>{formatCurrency(c.contractValue)}</strong></td>
                        <td className="date-cell">{c.expiryDate || 'N/A'}</td>
                        <td>
                          <span
                            className="badge-tag platform"
                            style={{
                              background: c.platform === 'LoopKids' ? 'rgba(234, 179, 8, 0.2)' : '#2a1c16',
                              border: c.platform === 'LoopKids' ? '1px solid rgba(234, 179, 8, 0.55)' : '1px solid #4a2b1b',
                              color: c.platform === 'LoopKids' ? '#facc15' : '#f07842',
                              fontWeight: 650
                            }}
                          >
                            {c.platform}
                          </span>
                        </td>
                        <td><span className={`status-pill ${tone}`}>{c.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                            <button className="icon-button" onClick={() => setDetailItem(c)} title="Inspect Contract Dossier">
                              <Eye size={16} />
                            </button>
                            <button className="icon-button" onClick={() => handleOpenEdit(c)} title="Edit Contract">
                              <Edit3 size={16} />
                            </button>
                            <button className="icon-button" onClick={() => setDeleteTarget(c)} title="Delete Contract" style={{ color: '#dc6464' }}>
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
                    <th>RIGHTS TITLE & ID</th>
                    <th>PROJECT</th>
                    <th>TERRITORY</th>
                    <th>RIGHTS TYPE</th>
                    <th>EXCLUSIVITY & TERM</th>
                    <th>LICENSE VALUATION</th>
                    <th>DISTRIBUTION</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRights.map(r => {
                    const tone = getStatusTone(r.status);
                    const rightImg = r.image || resolveContentRightPicture(r);
                    return (
                      <tr key={r.id}>
                        <td>
                          <div className="project-name" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="table-poster-thumb">
                              <img src={rightImg} alt={r.title} className="table-poster-img" loading="lazy" onError={(e) => { e.currentTarget.src = resolveContentRightPicture(r); }} />
                            </div>
                            <div>
                              <strong>{r.title}</strong>
                              <span>{r.id} · Starts: {r.startDate}</span>
                            </div>
                          </div>
                        </td>
                        <td><span style={{ fontWeight: 600 }}>{r.project}</span></td>
                        <td><span style={{ color: '#60a5fa', fontWeight: 650 }}>{r.territory}</span></td>
                        <td><span className="badge-tag">{r.rightsType}</span></td>
                        <td>
                          <span style={{ color: '#ded7d0' }}>{r.exclusivity}</span>
                          <div style={{ fontSize: '11px', color: '#8a96a8' }}>{r.rightsPeriod}</div>
                        </td>
                        <td><strong style={{ color: '#10b981' }}>{formatCurrency(r.licenseFee)}</strong></td>
                        <td>
                          <span
                            className="badge-tag platform"
                            style={{
                              background: r.platform === 'LoopKids' ? 'rgba(234, 179, 8, 0.2)' : '#2a1c16',
                              border: r.platform === 'LoopKids' ? '1px solid rgba(234, 179, 8, 0.55)' : '1px solid #4a2b1b',
                              color: r.platform === 'LoopKids' ? '#facc15' : '#f07842',
                              fontWeight: 650
                            }}
                          >
                            {r.platform}
                          </span>
                        </td>
                        <td><span className={`status-pill ${tone}`}>{r.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                            <button className="icon-button" onClick={() => setDetailItem(r)} title="Inspect Rights Clearance">
                              <Eye size={16} />
                            </button>
                            <button className="icon-button" onClick={() => handleOpenEdit(r)} title="Edit Content Right">
                              <Edit3 size={16} />
                            </button>
                            <button className="icon-button" onClick={() => setDeleteTarget(r)} title="Delete Content Right" style={{ color: '#dc6464' }}>
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
        {((activeTab === 'contracts' && filteredContracts.length === 0) || (activeTab === 'rights' && filteredRights.length === 0)) && (
          <div className="empty-state">
            <Scale size={36} style={{ color: '#e3652e', margin: '0 auto 12px', display: 'block', opacity: 0.8 }} />
            <strong style={{ display: 'block', color: '#f4f0eb', fontSize: '14px', marginBottom: '4px' }}>
              No legal agreements or rights records found
            </strong>
            <p style={{ margin: 0 }}>Try clearing your search query or reset filter selections.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
              onClick={handleOpenCreate}
            >
              <Plus size={16} /> {activeTab === 'contracts' ? 'Create Legal Contract' : 'Register Content Right'}
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
                <h2>{activeTab === 'contracts' ? 'Create New Legal Agreement' : 'Register Content Right'}</h2>
                <p>
                  {activeTab === 'contracts'
                    ? 'Bind an enforceable pact with cast, crew, or licensing partner.'
                    : 'Define windowing rights, territorial boundaries, and backend royalty splits.'}
                </p>
              </div>
              <button type="button" className="icon-button" onClick={() => setCreateModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {activeTab === 'contracts' ? (
              <>
                <div className="form-grid-2">
                  <label>
                    Agreement Title *
                    <input
                      required
                      placeholder="e.g. Lead Talent Agreement - Manoj Bajpayee"
                      value={contractFormData.title}
                      onChange={e => setContractFormData({ ...contractFormData, title: e.target.value })}
                    />
                  </label>
                  <label>
                    Associated Production
                    <select
                      value={contractFormData.project}
                      onChange={e => setContractFormData({ ...contractFormData, project: e.target.value })}
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    Counterparty / Entity *
                    <input
                      required
                      placeholder="e.g. Exceed Entertainment Pvt Ltd"
                      value={contractFormData.counterparty}
                      onChange={e => setContractFormData({ ...contractFormData, counterparty: e.target.value })}
                    />
                  </label>
                  <label>
                    Classification
                    <select
                      value={contractFormData.agreementType}
                      onChange={e => setContractFormData({ ...contractFormData, agreementType: e.target.value })}
                    >
                      <option>Talent / Cast Agreement</option>
                      <option>Director Service Contract</option>
                      <option>Music Synchronization License</option>
                      <option>Crew NDA & Work-for-Hire</option>
                      <option>OTT Platform Distribution Agreement</option>
                    </select>
                  </label>
                  <label>
                    Contract Value (₹ INR)
                    <input
                      type="number"
                      placeholder="e.g. 22000000"
                      value={contractFormData.contractValue}
                      onChange={e => setContractFormData({ ...contractFormData, contractValue: e.target.value })}
                    />
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    Effective Date
                    <input
                      type="date"
                      value={contractFormData.effectiveDate}
                      onChange={e => setContractFormData({ ...contractFormData, effectiveDate: e.target.value })}
                    />
                  </label>
                  <label>
                    Expiry Date
                    <input
                      type="date"
                      value={contractFormData.expiryDate}
                      onChange={e => setContractFormData({ ...contractFormData, expiryDate: e.target.value })}
                    />
                  </label>
                  <label>
                    Platform Target
                    <select
                      value={contractFormData.platform}
                      onChange={e => setContractFormData({ ...contractFormData, platform: e.target.value })}
                    >
                      <option value="LoopNexus">LoopNexus</option>
                      <option value="LoopKids">LoopKids</option>
                    </select>
                  </label>
                </div>

                <div className="form-grid-2">
                  <label>
                    Governing Law Jurisdiction
                    <input
                      placeholder="e.g. High Court of Bombay, Mumbai"
                      value={contractFormData.governingLaw}
                      onChange={e => setContractFormData({ ...contractFormData, governingLaw: e.target.value })}
                    />
                  </label>
                  <label>
                    Authorized Signatories
                    <input
                      placeholder="e.g. Zoya Akhtar (Producer) & Talent"
                      value={contractFormData.legalSignatory}
                      onChange={e => setContractFormData({ ...contractFormData, legalSignatory: e.target.value })}
                    />
                  </label>
                </div>

                <label>
                  Payment Tranches & Milestones
                  <input
                    placeholder="e.g. 30% Signing · 40% Wrap · 30% Delivery"
                    value={contractFormData.paymentTerms}
                    onChange={e => setContractFormData({ ...contractFormData, paymentTerms: e.target.value })}
                  />
                </label>

                <MediaImagePicker
                  value={contractFormData.image}
                  onChange={img => setContractFormData({ ...contractFormData, image: img })}
                  label="Contract Document / Key Art Picture"
                  defaultFallback={resolveContractPicture(contractFormData)}
                  placeholder="Paste legal contract image URL or choose local image file..."
                />
              </>
            ) : (
              <>
                <div className="form-grid-2">
                  <label>
                    Content Right Title *
                    <input
                      required
                      placeholder="e.g. Exclusive Worldwide SVOD & Streaming Rights"
                      value={rightFormData.title}
                      onChange={e => setRightFormData({ ...rightFormData, title: e.target.value })}
                    />
                  </label>
                  <label>
                    Associated Production
                    <select
                      value={rightFormData.project}
                      onChange={e => setRightFormData({ ...rightFormData, project: e.target.value })}
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    Licensed Territory *
                    <input
                      required
                      placeholder="e.g. Worldwide, India Subcontinent (SAARC)"
                      value={rightFormData.territory}
                      onChange={e => setRightFormData({ ...rightFormData, territory: e.target.value })}
                    />
                  </label>
                  <label>
                    Rights Classification
                    <select
                      value={rightFormData.rightsType}
                      onChange={e => setRightFormData({ ...rightFormData, rightsType: e.target.value })}
                    >
                      <option>SVOD / OTT Subscription</option>
                      <option>Theatrical Exhibition</option>
                      <option>Linear Satellite Broadcast</option>
                      <option>In-Flight / Maritime</option>
                      <option>SVOD / Educational & Institutional</option>
                    </select>
                  </label>
                  <label>
                    License Valuation (₹ INR)
                    <input
                      type="number"
                      placeholder="e.g. 145000000"
                      value={rightFormData.licenseFee}
                      onChange={e => setRightFormData({ ...rightFormData, licenseFee: e.target.value })}
                    />
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    Exclusivity
                    <select
                      value={rightFormData.exclusivity}
                      onChange={e => setRightFormData({ ...rightFormData, exclusivity: e.target.value })}
                    >
                      <option>Exclusive</option>
                      <option>Non-Exclusive</option>
                      <option>First-Window Exclusive</option>
                    </select>
                  </label>
                  <label>
                    Window Term Duration
                    <input
                      placeholder="e.g. 5 Years, 60-day Window"
                      value={rightFormData.rightsPeriod}
                      onChange={e => setRightFormData({ ...rightFormData, rightsPeriod: e.target.value })}
                    />
                  </label>
                  <label>
                    Platform Target
                    <select
                      value={rightFormData.platform}
                      onChange={e => setRightFormData({ ...rightFormData, platform: e.target.value })}
                    >
                      <option value="LoopNexus">LoopNexus</option>
                      <option value="LoopKids">LoopKids</option>
                    </select>
                  </label>
                </div>

                <div className="form-grid-2">
                  <label>
                    Window Start Date
                    <input
                      type="date"
                      value={rightFormData.startDate}
                      onChange={e => setRightFormData({ ...rightFormData, startDate: e.target.value })}
                    />
                  </label>
                  <label>
                    Window End Date
                    <input
                      type="date"
                      value={rightFormData.endDate}
                      onChange={e => setRightFormData({ ...rightFormData, endDate: e.target.value })}
                    />
                  </label>
                </div>

                <label>
                  Holdback Windows & Screening Restrictions
                  <textarea
                    rows={3}
                    placeholder="e.g. No Linear broadcast in India for 18 months from OTT release"
                    value={rightFormData.restrictions}
                    onChange={e => setRightFormData({ ...rightFormData, restrictions: e.target.value })}
                  />
                </label>

                <MediaImagePicker
                  value={rightFormData.image}
                  onChange={img => setRightFormData({ ...rightFormData, image: img })}
                  label="Content Rights Certificate / License Art"
                  defaultFallback={resolveContentRightPicture(rightFormData)}
                  placeholder="Paste rights certificate image URL or choose local image file..."
                />
              </>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-light" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {activeTab === 'contracts' ? 'Execute Contract Entry' : 'Register Rights Deal'}
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
                <h2>Edit {activeTab === 'contracts' ? `Contract (${editItem.id})` : `Content Right (${editItem.id})`}</h2>
                <p>Modify legal terms, financial valuation, or distribution windows.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setEditItem(null)}>
                <X size={18} />
              </button>
            </div>

            {activeTab === 'contracts' ? (
              <>
                <div className="form-grid-2">
                  <label>
                    Agreement Title
                    <input
                      required
                      value={contractFormData.title}
                      onChange={e => setContractFormData({ ...contractFormData, title: e.target.value })}
                    />
                  </label>
                  <label>
                    Counterparty
                    <input
                      required
                      value={contractFormData.counterparty}
                      onChange={e => setContractFormData({ ...contractFormData, counterparty: e.target.value })}
                    />
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    Contract Value (₹ INR)
                    <input
                      type="number"
                      value={contractFormData.contractValue}
                      onChange={e => setContractFormData({ ...contractFormData, contractValue: e.target.value })}
                    />
                  </label>
                  <label>
                    Status
                    <select
                      value={contractFormData.status}
                      onChange={e => setContractFormData({ ...contractFormData, status: e.target.value })}
                    >
                      <option>Executed / Signed</option>
                      <option>Under Legal Review</option>
                      <option>In Negotiation</option>
                    </select>
                  </label>
                  <label>
                    Platform
                    <select
                      value={contractFormData.platform}
                      onChange={e => setContractFormData({ ...contractFormData, platform: e.target.value })}
                    >
                      <option value="LoopNexus">LoopNexus</option>
                      <option value="LoopKids">LoopKids</option>
                    </select>
                  </label>
                </div>

                <div className="form-grid-2">
                  <label>
                    Governing Law
                    <input
                      value={contractFormData.governingLaw}
                      onChange={e => setContractFormData({ ...contractFormData, governingLaw: e.target.value })}
                    />
                  </label>
                  <label>
                    Signatories
                    <input
                      value={contractFormData.legalSignatory}
                      onChange={e => setContractFormData({ ...contractFormData, legalSignatory: e.target.value })}
                    />
                  </label>
                </div>

                <MediaImagePicker
                  value={contractFormData.image}
                  onChange={img => setContractFormData({ ...contractFormData, image: img })}
                  label="Contract Document / Key Art Picture"
                  defaultFallback={resolveContractPicture(contractFormData)}
                  placeholder="Paste legal contract image URL or choose local image file..."
                />
              </>
            ) : (
              <>
                <div className="form-grid-2">
                  <label>
                    Right Title
                    <input
                      required
                      value={rightFormData.title}
                      onChange={e => setRightFormData({ ...rightFormData, title: e.target.value })}
                    />
                  </label>
                  <label>
                    Territory
                    <input
                      required
                      value={rightFormData.territory}
                      onChange={e => setRightFormData({ ...rightFormData, territory: e.target.value })}
                    />
                  </label>
                </div>

                <div className="form-grid-3">
                  <label>
                    License Valuation (₹ INR)
                    <input
                      type="number"
                      value={rightFormData.licenseFee}
                      onChange={e => setRightFormData({ ...rightFormData, licenseFee: e.target.value })}
                    />
                  </label>
                  <label>
                    Exclusivity
                    <select
                      value={rightFormData.exclusivity}
                      onChange={e => setRightFormData({ ...rightFormData, exclusivity: e.target.value })}
                    >
                      <option>Exclusive</option>
                      <option>Non-Exclusive</option>
                    </select>
                  </label>
                  <label>
                    Platform
                    <select
                      value={rightFormData.platform}
                      onChange={e => setRightFormData({ ...rightFormData, platform: e.target.value })}
                    >
                      <option value="LoopNexus">LoopNexus</option>
                      <option value="LoopKids">LoopKids</option>
                    </select>
                  </label>
                </div>

                <MediaImagePicker
                  value={rightFormData.image}
                  onChange={img => setRightFormData({ ...rightFormData, image: img })}
                  label="Content Rights Certificate / License Art"
                  defaultFallback={resolveContentRightPicture(rightFormData)}
                  placeholder="Paste rights certificate image URL or choose local image file..."
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
            {/* Contextual Visual Header (Legal parchment & seal / world territory streaming map) */}
            <div style={{ position: 'relative', width: '100%', height: '170px', background: '#111', overflow: 'hidden' }}>
              <img
                src={activeTab === 'contracts' ? (detailItem.image || resolveContractPicture(detailItem)) : (detailItem.image || resolveContentRightPicture(detailItem))}
                alt={detailItem.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%', filter: 'brightness(0.7) contrast(1.1)' }}
                onError={(e) => {
                  e.currentTarget.src = activeTab === 'contracts'
                    ? resolveContractPicture(detailItem)
                    : resolveContentRightPicture(detailItem);
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
                    {activeTab === 'contracts' ? <Scale size={22} /> : <Globe size={22} />}
                  </div>
                  <div>
                    <h2>{detailItem.title}</h2>
                    <p>{detailItem.id} · {detailItem.project} · {activeTab === 'contracts' ? detailItem.agreementType : detailItem.rightsType}</p>
                  </div>
                </div>
              </div>

              {/* Overview Section */}
              <div className="detail-section">
                <h4>Legal Dossier Overview</h4>
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
                    <span>{activeTab === 'contracts' ? 'Contract Value' : 'License Fee'}</span>
                    <strong style={{ color: '#10b981' }}>
                      {formatCurrency(activeTab === 'contracts' ? detailItem.contractValue : detailItem.licenseFee)}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>{activeTab === 'contracts' ? 'Counterparty' : 'Territory'}</span>
                    <strong style={{ color: activeTab === 'contracts' ? '#f4f0eb' : '#60a5fa' }}>
                      {activeTab === 'contracts' ? detailItem.counterparty : detailItem.territory}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Payment / Holdback terms */}
              <div className="detail-section">
                <h4>{activeTab === 'contracts' ? 'Payment Schedule & Enforceability' : 'Windowing & Holdback Stipulations'}</h4>
                <p style={{ fontSize: '13px', color: '#c6bdb5', lineHeight: '1.6', margin: '0 0 10px' }}>
                  {activeTab === 'contracts' ? detailItem.paymentTerms : detailItem.restrictions}
                </p>
                {activeTab === 'contracts' ? (
                  <p style={{ fontSize: '12px', color: '#8a96a8', margin: 0 }}>
                    Jurisdiction: <span style={{ color: '#f07842' }}>{detailItem.governingLaw}</span> · Signatories: {detailItem.legalSignatory}
                  </p>
                ) : (
                  <p style={{ fontSize: '12px', color: '#8a96a8', margin: 0 }}>
                    Window Term: <span style={{ color: '#f07842' }}>{detailItem.rightsPeriod} ({detailItem.startDate} to {detailItem.endDate || 'Perpetual'})</span> · Backend: {detailItem.revenueSharePct}
                  </p>
                )}
              </div>

              {/* Simulated PDF Download Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#202020', padding: '12px 16px', borderRadius: '10px', marginTop: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={20} style={{ color: '#ef4444' }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#fff', display: 'block' }}>
                      {activeTab === 'contracts' ? `${detailItem.id}_Executed_Agreement.pdf` : `Territory_Clearance_Certificate_${detailItem.id}.pdf`}
                    </strong>
                    <span style={{ fontSize: '11px', color: '#888' }}>Digital Legal Seal Verified · 3.6 MB</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => alert(`Simulating PDF download for: ${detailItem.id}.pdf`)}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  <Download size={14} /> Download Document
                </button>
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
                <strong style={{ color: '#fff' }}>{deleteTarget.title}</strong> ({deleteTarget.id})? All legal deed ledger records will be purged.
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
