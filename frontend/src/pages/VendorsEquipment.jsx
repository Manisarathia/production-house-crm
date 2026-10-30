import { useState, useEffect } from 'react';
import { Plus, Search, Truck, Package, X, Calendar } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/finance/vendors';

export default function VendorsEquipment() {
    const [vendors, setVendors] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [q, setQ] = useState('');
    const [show, setShow] = useState(false);
    const [showEq, setShowEq] = useState(false);
    const [showRentModal, setShowRentModal] = useState(false);
    const [mode, setMode] = useState('Vendors');
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('CAMERA_AND_LENSES');
    const [contactEmail, setContactEmail] = useState('');
    const [eqName, setEqName] = useState('');
    const [dailyRate, setDailyRate] = useState('');
    const [selectedVendorId, setSelectedVendorId] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [rentProjectId, setRentProjectId] = useState('proj-uuid-101');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [rentError, setRentError] = useState('');
    const [categories, setCategories] = useState([]);


    const fetchVendors = async () => {
        try {
            const response = await fetch(API_BASE_URL);
            if (response.ok) {
                const data = await response.json();
                setVendors(data);
                if (data.length > 0 && !selectedVendorId) {
                    setSelectedVendorId(data[0].id);
                }
            }
        } catch (error) {
            console.error("Network connectivity issue fetching vendors:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
                if (data.length > 0 && !category) {
                    setCategory(data[0]);
                }
            }
        } catch (error) {
            console.error("Error loading vendor categories:", error);
        }
    };

    const fetchEquipment = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/equipment`);
            if (response.ok) {
                const data = await response.json();
                setEquipment(data);
            }
        } catch (error) {
            console.error("Network connectivity issue fetching equipment:", error);
        }
    };

    const refreshAllData = async () => {
        setLoading(true);
        await Promise.all([fetchVendors(), fetchEquipment(), fetchCategories()]);
        setLoading(false);
    };

    useEffect(() => {
        refreshAllData();
    }, [mode]);

    async function addVendor(e) {
        e.preventDefault();
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, category, contactEmail, status: 'INACTIVE' }),
            });
            if (response.ok) {
                await refreshAllData();
                setShow(false);
                setName('');
                setContactEmail('');

            }
        } catch (error) {
            console.error("Failure adding vendor:", error);
        }
    }

    async function addEquipment(e) {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/${selectedVendorId}/equipment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: eqName, dailyRate: parseFloat(dailyRate), status: 'AVAILABLE' }),
            });
            if (response.ok) {
                await refreshAllData();
                setShowEq(false);
                setEqName('');
                setDailyRate('');
            }
        } catch (error) {
            console.error("Failure adding equipment:", error);
        }
    }

    async function handleRentEquipment(e) {
        e.preventDefault();
        setRentError('');

        const payload = {
            projectId: rentProjectId,
            equipmentId: selectedEquipment.id,
            startDate,
            endDate
        };

        try {
            const response = await fetch(`${API_BASE_URL}/equipment/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                await refreshAllData();
                setShowRentModal(false);
                setStartDate('');
                setEndDate('');
                setRentError('');
            } else {
                const errorPayload = await response.json();
                setRentError(errorPayload.message || 'Date selection metrics validation failed.');
            }
        } catch (error) {
            console.error("Booking connection failure:", error);
            setRentError("Could not connect to the Spring Boot server.");
        }
    }

    async function handleDeleteVendor(vendorId, e) {
        e.stopPropagation();
        try {
            const response = await fetch(`${API_BASE_URL}/${vendorId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await refreshAllData();
            } else {
                console.error("Failed to delete vendor record from backend.");
            }
        } catch (error) {
            console.error("Deletion communication error:", error);
        }
    }

    async function handleDeleteEquipment(equipmentId, e) {
        e.stopPropagation();
        try {
            const response = await fetch(`${API_BASE_URL}/equipment/${equipmentId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await refreshAllData();
            } else {
                console.error("Failed to delete equipment record from backend.");
            }
        } catch (error) {
            console.error("Deletion communication error:", error);
        }
    }


    async function toggleEquipmentMaintenance(equipmentId, currentStatus) {
        const nextStatus = currentStatus === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
        try {
            const response = await fetch(`${API_BASE_URL}/equipment/${equipmentId}/status?status=${nextStatus}`, {
                method: 'PATCH'
            });
            if (response.ok) {
                await refreshAllData();
            }
        } catch (error) {
            console.error("Error setting equipment maintenance status flags:", error);
        }
    }

    const filteredVendors = vendors.filter(v => (v.name + v.category + v.contactEmail).toLowerCase().includes(q.toLowerCase()));
    const filteredEquipment = equipment.filter(x => (x.name + x.id + x.status).toLowerCase().includes(q.toLowerCase()));

    const mapCategoryLabel = (cat) => {
        if (!cat) return 'General Provider';

        const normalizedCat = String(cat).toUpperCase();

        if (normalizedCat === 'CAMERA_AND_LENSES') return 'Equipment rental';
        if (normalizedCat === 'LIGHTING') return 'Lighting & grip';
        if (normalizedCat === 'AUDIO_GEAR') return 'Audio equipment';

        if (normalizedCat === 'CATERING') return 'Catering services';
        if (normalizedCat === 'LOGISTICS_AND_TRANSPORT') return 'Transport & Logistics';
        if (normalizedCat === 'LOCATION_LEASE') return 'Location & Recce Lease';
        if (normalizedCat === 'OTHER') return 'Other Production Services';

        return normalizedCat
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    const getStatusTone = (status) => {
        if (status === 'AVAILABLE') return 'green';
        if (status === 'RENTED') return 'blue';
        if (status === 'MAINTENANCE') return 'orange';
        return 'orange';
    };

    return (
        <>
            <div className="page-heading">
                <div>
                    <div className="eyebrow">FINANCE & RESOURCES</div>
                    <h1>Vendors & Equipment</h1>
                </div>
                <div className="heading-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ background: "#e3652e" }} className="btn btn-light" onClick={() => setShowEq(true)}><Plus size={18} /> Add equipment</button>
                    <button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={18} /> Add vendor</button>
                </div>
            </div>

            <div className="mini-stats">
                <div style={{ color: '#ffffff' }} className="mini-stat">
                    <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>Active vendors</span>
                    <strong style={{ color: '#ffffff' }} >{vendors.length}</strong>
                </div>
                <div className="mini-stat">
                    <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>Available Assets</span>
                    <strong style={{ color: '#ffffff' }} >{equipment.filter(e => e.status === 'AVAILABLE').length}</strong>
                </div>
                <div className="mini-stat">
                    <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>Currently Rented</span>
                    <strong style={{ color: '#ffffff' }} >{equipment.filter(e => e.status === 'RENTED').length}</strong>
                </div>
                <div className="mini-stat">
                    <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>Needs attention</span>
                    <strong style={{ color: '#ffffff' }} >{equipment.filter(e => e.status === 'MAINTENANCE').length}</strong>
                </div>
            </div>

            <div className="panel page-panel">
                <div className="panel-head">
                    <div ><h2 style = {{fontSize: '18px'}}>Resource directory</h2></div>
                    <div className="inline-actions">
                        <div className="segmented">
                            <button className={mode === 'Vendors' ? 'chosen' : ''} onClick={() => setMode('Vendors')}><Truck size={15} /> Vendors</button>
                            <button className={mode === 'Equipment' ? 'chosen' : ''} onClick={() => setMode('Equipment')}><Package size={15} /> Equipment</button>
                        </div>
                        <label className="table-search"><Search size={16} /><input placeholder="Search resources..." value={q} onChange={e => setQ(e.target.value)} /></label>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Synchronizing structural system matrices...</div>
                ) : mode === 'Vendors' ? (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>VENDOR</th>
                                    <th>SERVICE TYPE</th>
                                    <th>CONTACT</th>
                                    <th>ASSETS </th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVendors.map(v => (
                                    <tr key={v.id}>
                                        <td><div className="project-name"><div className="department-icon blue"><Truck size={18} /></div><div><strong>{v.name}</strong></div></div></td>
                                        <td>
                                            <span style={{ fontWeight: '500' }}>
                                                {mapCategoryLabel(v.category)}
                                            </span>
                                        </td>
                                        <td><code>{v.contactEmail}</code></td>
                                        <td><strong>{v.equipment ? v.equipment.length : 0}</strong></td>
                                        <td>
                                            <span className={`status-pill ${v.status === 'ACTIVE' ? 'green' : 'red'}`}>
                                                {v.status ? v.status.toUpperCase() : 'INACTIVE'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="reject-btn"
                                                onClick={(e) => handleDeleteVendor(v.id, e)}
                                                style={{ padding: '4px 8px', fontSize: '10px' }}
                                            >
                                                Remove
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="resource-cards">
                        {filteredEquipment.map(x => (
                            <div
                                className="resource-card"
                                key={x.id}
                                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                            >
                                <div
                                    onClick={() => {
                                        if (x.status === 'AVAILABLE') {
                                            setSelectedEquipment(x);
                                            setShowRentModal(true);
                                        }
                                    }}
                                    style={{ cursor: x.status === 'AVAILABLE' ? 'pointer' : 'not-allowed', flex: 1 }}
                                >
                                    <div className="department-icon blue">
                                        <Package size={20} />
                                    </div>
                                    <h3>{x.name}</h3>
                                    <div style={{ fontSize: '11px', color: '#a7a09a', marginBottom: '12px', fontWeight: '500' }}>
                                        Provider: <strong style={{ color: '#f4f0eb' }}>{x.vendor && x.vendor.name ? x.vendor.name : 'Unknown Supplier'}</strong>
                                    </div>
                            
                                    <div>
                                        <span className={`status-pill ${getStatusTone(x.status)}`}>
                                            {x.status.toLowerCase()}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '12px', fontSize: '13px', fontWeight: '600', color: '#2c3e50' }}>
                                        Base Rate: ₹{x.dailyRate || '0.00'}/day
                                    </div>
                                </div>

                                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #303030', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button
                                        type="button"
                                        style={{ border: '0', background: 'transparent', color: '#ff8989', fontSize: '11px', cursor: 'pointer', padding: '0' }}
                                        onClick={(e) => handleDeleteEquipment(x.id, e)}
                                    > Delete Set
                                    </button>
                                    <button
                                        type="button"
                                        className={x.status === 'MAINTENANCE' ? 'approve-btn' : 'reject-btn'}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleEquipmentMaintenance(x.id, x.status);
                                        }}>
                                        {x.status === 'MAINTENANCE' ? 'Mark Available' : 'Flag Maintenance'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {show && (
                <div className="modal-backdrop" onClick={() => setShow(false)}>
                    <form className="modal-card" onSubmit={addVendor} onClick={e => e.stopPropagation()}>
                        <div className="modal-head">
                            <div>
                                <h2>Add vendor partner</h2>
                                <p>Onboard a new physical resource or equipment supplier.</p>
                            </div>
                            <button type="button" className="icon-button" onClick={() => setShow(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <label>
                            Vendor name
                            <input
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Company name"
                            />
                        </label>

                        <label> Service type
                            <select value={category} onChange={e => setCategory(e.target.value)}>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {mapCategoryLabel(cat)}
                                    </option>
                                ))}
                            </select>
                        </label>


                        <label>
                            Contact email
                            <input
                                required
                                type="email"
                                value={contactEmail}
                                onChange={e => setContactEmail(e.target.value)}
                                placeholder="contact@vendor.com"
                            />
                        </label>

                        <div className="modal-actions">
                            <button type="button" className="btn btn-light" onClick={() => setShow(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Save vendor</button>
                        </div>
                    </form>
                </div>
            )}

            {showEq && (
                <div className="modal-backdrop" onClick={() => setShowEq(false)}>
                    <form className="modal-card" onSubmit={addEquipment} onClick={e => e.stopPropagation()}>
                        <div className="modal-head">
                            <div>
                                <h2>Add equipment asset</h2>
                            </div>
                            <button type="button" className="icon-button" onClick={() => setShowEq(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <label>
                            Select Supplier Vendor
                            <select value={selectedVendorId} onChange={e => setSelectedVendorId(e.target.value)} required>
                                <option value="" disabled>-- Choose a Supplier --</option>
                                {vendors.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Equipment Name / Model
                            <input required value={eqName} onChange={e => setEqName(e.target.value)} placeholder="e.g. Arri Alexa Mini LF" />
                        </label>
                        <label>
                            Daily Rate (₹)
                            <input required type="number" min="0" step="0.01" value={dailyRate} onChange={e => setDailyRate(e.target.value)} placeholder="e.g. 1500" />
                        </label>
                        <div className="modal-actions">
                            <button type="button" className="btn btn-light" onClick={() => setShowEq(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Save asset</button>
                        </div>
                    </form>
                </div>
            )}
            {showRentModal && selectedEquipment && (
                <div className="modal-backdrop" onClick={() => setShowRentModal(false)}>
                    <form className="modal-card" onSubmit={handleRentEquipment} onClick={e => e.stopPropagation()}>
                        <div className="modal-head">
                            <div>
                                <h2>Rent: {selectedEquipment.name}</h2>
                                <p>Set valid deployment window timelines to secure booking tracks.</p>
                            </div>
                            <button type="button" className="icon-button" onClick={() => setShowRentModal(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        {rentError && (
                            <div className="login-error" style={{ marginBottom: '10px', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: '#ff8989' }}>✕</span> {rentError}
                            </div>
                        )}

                        <label>
                            Target Project Allocation
                            <select value={rentProjectId} onChange={e => setRentProjectId(e.target.value)}>
                                <option value="proj-uuid-101">The Last Monsoon</option>
                                <option value="proj-uuid-102">City of Echoes</option>
                                <option value="proj-uuid-103">Beyond The Frame</option>
                            </select>
                        </label>

                        <label>
                            Rental Start Date
                            <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </label>

                        <label>
                            Rental End Date
                            <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </label>

                        <div style={{ padding: '10px 0', fontSize: '12px', color: '#e3652e', fontWeight: '600' }}>
                            Base Asset Daily Cost Charge: ₹{selectedEquipment.dailyRate}/day
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn btn-light" onClick={() => setShowRentModal(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary"><Calendar size={15} /> Confirm Booking</button>
                        </div>
                    </form>
                </div>
            )}

        </>
    );
}

