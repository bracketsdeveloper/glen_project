import { useEffect, useState } from 'react';
import AssignModal from './components/modals/AssignModal';
import EmployeeManager from './components/modals/EmployeeManager';
import JobManager from './components/modals/JobManager';

const API_URL = 'http://127.0.0.1:5000';

function App() {
    const [employees, setEmployees] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [schedule, setSchedule] = useState([]);

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(true);

    // Global Dashboard Date
    const [dashboardDate, setDashboardDate] = useState('');

    // Modal controls
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isManageEmpModalOpen, setIsManageEmpModalOpen] = useState(false);
    const [isManageJobModalOpen, setIsManageJobModalOpen] = useState(false);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setDashboardDate(today);
    }, []);

    useEffect(() => {
        if (dashboardDate) {
            fetchData();
        }
    }, [dashboardDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [empRes, jobRes, schedRes] = await Promise.all([
                fetch(`${API_URL}/employees`),
                fetch(`${API_URL}/jobs`),
                fetch(`${API_URL}/schedule?date=${dashboardDate}`)
            ]);
            const empData = await empRes.json();
            const jobData = await jobRes.json();
            const schedData = await schedRes.json();

            setEmployees(empData);
            setJobs(jobData);
            setSchedule(schedData);
            setLoading(false);
        } catch (err) {
            setErrorMsg('Failed to connect to the backend server. Is it running?');
            setLoading(false);
        }
    };

    // Check if the currently viewed dashboard date is strictly in the past
    const todayStr = new Date().toISOString().split('T')[0];
    const isPastDate = dashboardDate !== '' && dashboardDate < todayStr;

    const handlePrevDate = () => {
        if (!dashboardDate) return;
        const d = new Date(dashboardDate);
        d.setDate(d.getDate() - 1);
        setDashboardDate(d.toISOString().split('T')[0]);
    };

    const handleNextDate = () => {
        if (!dashboardDate) return;
        const d = new Date(dashboardDate);
        d.setDate(d.getDate() + 1);
        setDashboardDate(d.toISOString().split('T')[0]);
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API_URL}/assign/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showSuccess('Assignment removed.');
            } else {
                const data = await res.json();
                showError(data.error || 'Failed to remove assignment.');
            }
        } catch (err) {
            showError('Network error while deleting.');
        }
    };

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const showError = (msg) => {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(''), 4000);
    };

    if (loading) {
        return <div className="loading">Loading scheduling system...</div>;
    }

    return (
        <div className="container">
            <header className="header-flex">
                <div>
                    <h1>Mini Scheduling System</h1>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={() => { setErrorMsg(''); setIsManageEmpModalOpen(true); }}>
                        Manage Employees
                    </button>
                    <button className="btn btn-secondary" onClick={() => { setErrorMsg(''); setIsManageJobModalOpen(true); }}>
                        Manage Job Shifts
                    </button>
                    <button className="btn btn-primary" title={isPastDate ? "Cannot assign on past dates" : ""} disabled={isPastDate} style={isPastDate ? { opacity: 0.5, cursor: 'not-allowed' } : {}} onClick={() => setIsAssignModalOpen(true)}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        New Assignment
                    </button>
                </div>
            </header>

            {errorMsg && <div className="error-msg">{errorMsg}</div>}
            {successMsg && <div className="success-msg">{successMsg}</div>}

            <div className="card">
                <div className="date-picker-container">
                    <button className="date-btn" onClick={handlePrevDate} title="Previous Date">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </button>
                    <input
                        type="date"
                        className="date-picker-input"
                        value={dashboardDate}
                        onChange={e => setDashboardDate(e.target.value)}
                        title="Select Date"
                    />
                    <button className="date-btn" onClick={handleNextDate} title="Next Date">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>

                <div className="card-title">Assigned Schedule Dashboard</div>

                {schedule.length === 0 ? (
                    <div className="empty-state">
                        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5, marginBottom: '1rem' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p>No jobs have been assigned yet.</p>
                        {!isPastDate && (
                            <button className="btn btn-secondary" onClick={() => setIsAssignModalOpen(true)} style={{ marginTop: '1rem' }}>Create First Assignment</button>
                        )}
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Role</th>
                                    <th>Job Task</th>
                                    <th>Shift Window</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.map(assign => {
                                    const emp = employees.find(e => e.id == assign.employeeId);
                                    const job = jobs.find(j => j.id == assign.jobId);
                                    if (!emp || !job) return null;
                                    return (
                                        <tr key={assign.id}>
                                            <td style={{ fontWeight: 500 }}>{emp.name}</td>
                                            <td><span className="badge badge-role">{emp.role}</span></td>
                                            <td style={{ fontWeight: 500 }}>{job.name}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>{job.startTime} - {job.endTime}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                {!isPastDate && (
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() => handleDelete(assign.id)}
                                                        title="Remove Assignment"
                                                    >
                                                        Revoke
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AssignModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                employees={employees}
                jobs={jobs}
                dashboardDate={dashboardDate}
                API_URL={API_URL}
                onSuccess={showSuccess}
                onError={showError}
            />

            <EmployeeManager
                isOpen={isManageEmpModalOpen}
                onClose={() => setIsManageEmpModalOpen(false)}
                employees={employees}
                API_URL={API_URL}
                onSuccess={showSuccess}
                onError={showError}
            />

            <JobManager
                isOpen={isManageJobModalOpen}
                onClose={() => setIsManageJobModalOpen(false)}
                jobs={jobs}
                API_URL={API_URL}
                onSuccess={showSuccess}
                onError={showError}
            />
        </div>
    );
}

export default App;
