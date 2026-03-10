import { useState, useMemo } from 'react';

export default function AssignModal({ isOpen, onClose, employees, jobs, dashboardDate, API_URL, onSuccess, onError }) {
    const [roleFilter, setRoleFilter] = useState('All');
    const [availFilter, setAvailFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEmpIds, setSelectedEmpIds] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [modalError, setModalError] = useState('');

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchRole = roleFilter === 'All' || emp.role === roleFilter;
            let matchAvail = true;
            if (availFilter === 'Available') matchAvail = emp.availability === true;
            if (availFilter === 'Unavailable') matchAvail = emp.availability === false;
            const matchSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchRole && matchAvail && matchSearch;
        });
    }, [employees, roleFilter, availFilter, searchQuery]);

    const handleAssign = async () => {
        setModalError('');
        if (selectedEmpIds.length === 0 || !selectedJobId) {
            setModalError('Please select at least one employee and a job.');
            return;
        }
        try {
            const res = await fetch(`${API_URL}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeIds: selectedEmpIds, jobId: selectedJobId, date: dashboardDate })
            });
            const data = await res.json();
            if (!res.ok) {
                setModalError(data.error || 'Failed to assign job.');
            } else {
                onSuccess('Job successfully assigned!');
                setSelectedEmpIds([]);
                setSelectedJobId('');
                onClose();
            }
        } catch (err) {
            setModalError('Network error. Failed to assign.');
        }
    };

    const handleClose = () => {
        setModalError('');
        setSelectedEmpIds([]);
        setSelectedJobId('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Assignment</h2>
                    <button className="close-btn" onClick={handleClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {modalError && <div className="error-msg" style={{ marginBottom: '1.5rem' }}>{modalError}</div>}

                    <div className="grid-2">
                        {/* Left Side: Employee Selection */}
                        <div>
                            <div className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>1. Select Employees</div>
                            <div className="filters">
                                <input
                                    type="text"
                                    placeholder="Search name..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                                    <option value="All">All Roles</option>
                                    <option value="TCP">TCP</option>
                                    <option value="LCT">LCT</option>
                                    <option value="Supervisor">Supervisor</option>
                                </select>
                                <select value={availFilter} onChange={e => setAvailFilter(e.target.value)}>
                                    <option value="All">All Status</option>
                                    <option value="Available">Available</option>
                                    <option value="Unavailable">Unavailable</option>
                                </select>
                            </div>

                            <div className="list-container" style={{ height: '320px' }}>
                                {filteredEmployees.map(emp => {
                                    const isSelected = selectedEmpIds.includes(emp.id);
                                    return (
                                        <div
                                            key={emp.id}
                                            className={`list-item ${isSelected ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedEmpIds(prev =>
                                                    prev.includes(emp.id)
                                                        ? prev.filter(id => id !== emp.id)
                                                        : [...prev, emp.id]
                                                );
                                            }}
                                        >
                                            <div className="list-item-content">
                                                <strong>{emp.name}</strong>
                                                <span className="badge badge-role" style={{ marginLeft: '0.5rem' }}>{emp.role}</span>
                                            </div>
                                            <div className={`list-item-status ${emp.availability ? 'status-avail' : 'status-unavail'}`}>
                                                {emp.availability ? 'Available' : 'Unavailable'}
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredEmployees.length === 0 && (
                                    <div className="empty-state" style={{ padding: '2rem' }}>No employees match existing filters</div>
                                )}
                            </div>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                {selectedEmpIds.length} employee(s) selected
                            </p>
                        </div>

                        {/* Right Side: Job Selection */}
                        <div>
                            <div className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>2. Select Job Shift</div>
                            <div className="list-container" style={{ height: '425px' }}>
                                {jobs.map(job => (
                                    <div
                                        key={job.id}
                                        className={`list-item ${selectedJobId == job.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedJobId(job.id)}
                                    >
                                        <div className="list-item-content">
                                            <strong>{job.name}</strong>
                                        </div>
                                        <div className="list-item-status" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            {job.startTime} to {job.endTime}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleAssign}>
                        Confirm Assignment(s)
                    </button>
                </div>
            </div>
        </div>
    );
}
