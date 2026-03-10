import { useState } from 'react';

export default function EmployeeManager({ isOpen, onClose, employees, API_URL, onSuccess, onError }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [modalError, setModalError] = useState('');

    const [newEmpName, setNewEmpName] = useState('');
    const [newEmpRole, setNewEmpRole] = useState('TCP');
    const [newEmpAvail, setNewEmpAvail] = useState(true);
    const [editEmpId, setEditEmpId] = useState(null);

    if (!isOpen) return null;

    const handleAddEmployee = async () => {
        setModalError('');
        if (!newEmpName) {
            setModalError('Employee name is required.');
            return;
        }
        try {
            const method = editEmpId ? 'PUT' : 'POST';
            const url = editEmpId ? `${API_URL}/employees/${editEmpId}` : `${API_URL}/employees`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newEmpName, role: newEmpRole, availability: newEmpAvail })
            });
            const data = await res.json();
            if (!res.ok) {
                setModalError(data.error || `Failed to ${editEmpId ? 'update' : 'add'} employee.`);
            } else {
                onSuccess(`Employee successfully ${editEmpId ? 'updated' : 'added'}!`);
                setNewEmpName('');
                setNewEmpRole('TCP');
                setNewEmpAvail(true);
                setEditEmpId(null);
                setIsFormOpen(false);
            }
        } catch (err) {
            setModalError('Network error. Failed to save employee.');
        }
    };

    const handleDeleteEmployee = async (id) => {
        if (!window.confirm("Are you sure? This removes the employee and active assignments.")) return;
        try {
            const res = await fetch(`${API_URL}/employees/${id}`, { method: 'DELETE' });
            if (res.ok) {
                onSuccess('Employee deleted.');
                if (editEmpId === id) {
                    setEditEmpId(null);
                    setNewEmpName('');
                    setNewEmpRole('TCP');
                    setNewEmpAvail(true);
                }
            } else {
                const data = await res.json();
                onError(data.error || 'Failed to delete employee.');
            }
        } catch (err) {
            onError('Network error while deleting employee.');
        }
    };

    const openFormForAdd = () => {
        setModalError('');
        setEditEmpId(null);
        setNewEmpName('');
        setNewEmpRole('TCP');
        setNewEmpAvail(true);
        setIsFormOpen(true);
    };

    const openFormForEdit = (emp) => {
        setModalError('');
        setEditEmpId(emp.id);
        setNewEmpName(emp.name);
        setNewEmpRole(emp.role);
        setNewEmpAvail(emp.availability);
        setIsFormOpen(true);
    };

    return (
        <>
            {/* Modal Overlay: Manage Employees */}
            {!isFormOpen && (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Manage Employees</h2>
                            <button className="btn btn-primary" style={{ marginLeft: 'auto', marginRight: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={openFormForAdd}>+ Add Employee</button>
                            <button className="close-btn" onClick={onClose}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees.map(emp => (
                                            <tr key={emp.id}>
                                                <td style={{ fontWeight: 500 }}>{emp.name}</td>
                                                <td><span className="badge badge-role">{emp.role}</span></td>
                                                <td>
                                                    <div className={`list-item-status ${emp.availability ? 'status-avail' : 'status-unavail'}`} style={{ display: 'inline-block' }}>
                                                        {emp.availability ? 'Available' : 'Unavailable'}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', marginRight: '0.5rem' }} onClick={() => openFormForEdit(emp)}>Edit</button>
                                                    <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleDeleteEmployee(emp.id)}>Del</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {employees.length === 0 && <div className="empty-state" style={{ padding: '2rem' }}>No employees found.</div>}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={onClose}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Overlay: Employee Form */}
            {isFormOpen && (
                <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>{editEmpId ? 'Edit Employee' : 'Add New Employee'}</h2>
                            <button className="close-btn" onClick={() => setIsFormOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {modalError && <div className="error-msg">{modalError}</div>}
                            <div className="form-group">
                                <label>Employee Name</label>
                                <input type="text" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} placeholder="e.g. John Doe" />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select value={newEmpRole} onChange={e => setNewEmpRole(e.target.value)}>
                                    <option value="TCP">TCP</option>
                                    <option value="LCT">LCT</option>
                                    <option value="Supervisor">Supervisor</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                                <input type="checkbox" id="empAvail" checked={newEmpAvail} onChange={e => setNewEmpAvail(e.target.checked)} style={{ width: 'auto' }} />
                                <label htmlFor="empAvail" style={{ margin: 0 }}>Mark as Available</label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddEmployee}>{editEmpId ? 'Save Changes' : 'Create Employee'}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
