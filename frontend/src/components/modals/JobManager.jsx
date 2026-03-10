import { useState } from 'react';

export default function JobManager({ isOpen, onClose, jobs, API_URL, onSuccess, onError }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [modalError, setModalError] = useState('');

    const [newJobName, setNewJobName] = useState('');
    const [newJobStart, setNewJobStart] = useState('');
    const [newJobEnd, setNewJobEnd] = useState('');
    const [editJobId, setEditJobId] = useState(null);

    if (!isOpen) return null;

    const handleAddJob = async () => {
        setModalError('');
        if (!newJobName || !newJobStart || !newJobEnd) {
            setModalError('All fields are required.');
            return;
        }
        try {
            const method = editJobId ? 'PUT' : 'POST';
            const url = editJobId ? `${API_URL}/jobs/${editJobId}` : `${API_URL}/jobs`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newJobName, startTime: newJobStart, endTime: newJobEnd })
            });
            const data = await res.json();
            if (!res.ok) {
                setModalError(data.error || `Failed to ${editJobId ? 'update' : 'add'} shift.`);
            } else {
                onSuccess(`Shift successfully ${editJobId ? 'updated' : 'added'}!`);
                setNewJobName('');
                setNewJobStart('');
                setNewJobEnd('');
                setEditJobId(null);
                setIsFormOpen(false);
            }
        } catch (err) {
            setModalError('Network error. Failed to save shift.');
        }
    };

    const handleDeleteJob = async (id) => {
        if (!window.confirm("Are you sure? This deletes the shift and removes linked assignments.")) return;
        try {
            const res = await fetch(`${API_URL}/jobs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                onSuccess('Shift deleted.');
                if (editJobId === id) {
                    setEditJobId(null);
                    setNewJobName('');
                    setNewJobStart('');
                    setNewJobEnd('');
                }
            } else {
                const data = await res.json();
                onError(data.error || 'Failed to delete shift.');
            }
        } catch (err) {
            onError('Network error while deleting shift.');
        }
    };

    const openFormForAdd = () => {
        setModalError('');
        setEditJobId(null);
        setNewJobName('');
        setNewJobStart('');
        setNewJobEnd('');
        setIsFormOpen(true);
    };

    const openFormForEdit = (job) => {
        setModalError('');
        setEditJobId(job.id);
        setNewJobName(job.name);
        setNewJobStart(job.startTime);
        setNewJobEnd(job.endTime);
        setIsFormOpen(true);
    };

    return (
        <>
            {/* Modal Overlay: Manage Jobs */}
            {!isFormOpen && (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Manage Job Shifts</h2>
                            <button className="btn btn-primary" style={{ marginLeft: 'auto', marginRight: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={openFormForAdd}>+ Add Shift</button>
                            <button className="close-btn" onClick={onClose}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Shift Name</th>
                                            <th>Start Time</th>
                                            <th>End Time</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jobs.map(job => (
                                            <tr key={job.id}>
                                                <td style={{ fontWeight: 500 }}>{job.name}</td>
                                                <td>{job.startTime}</td>
                                                <td>{job.endTime}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', marginRight: '0.5rem' }} onClick={() => openFormForEdit(job)}>Edit</button>
                                                    <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleDeleteJob(job.id)}>Del</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {jobs.length === 0 && <div className="empty-state" style={{ padding: '2rem' }}>No shifts found.</div>}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={onClose}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Overlay: Job Form */}
            {isFormOpen && (
                <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>{editJobId ? 'Edit Shift' : 'Add New Shift'}</h2>
                            <button className="close-btn" onClick={() => setIsFormOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {modalError && <div className="error-msg">{modalError}</div>}
                            <div className="form-group">
                                <label>Shift Name / Description</label>
                                <input type="text" value={newJobName} onChange={e => setNewJobName(e.target.value)} placeholder="e.g. Morning Patrol" />
                            </div>
                            <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="form-group">
                                    <label>Start Time</label>
                                    <input type="time" value={newJobStart} onChange={e => setNewJobStart(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>End Time</label>
                                    <input type="time" value={newJobEnd} onChange={e => setNewJobEnd(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddJob}>{editJobId ? 'Save Changes' : 'Create Shift'}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
