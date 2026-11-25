import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [passwordFormData, setPasswordFormData] = useState({});
    const navigate = useNavigate();
    
    const token = localStorage.getItem('spice_token');
    const userRole = localStorage.getItem('userRole');
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };

    // Apelează toate hookurile ÎNAINTE de orice logică condiționată
    useEffect(() => {
        // Verifică dacă utilizatorul e admin, altfel redirecționează
        if (!token || userRole !== 'ADMINISTRATOR') {
            navigate('/auth');
            return;
        }
        
        // Dacă e admin, încarcă datele
        fetchUpgradeRequests();
        fetchUsers();
    }, [token, userRole, navigate]);

    const fetchUpgradeRequests = async () => {
        try {
            const res = await axios.get('http://192.168.1.4:5000/api/admin/upgrade-requests', authConfig);
            setRequests(res.data);
        } catch (err) { console.error("Erorr upgrade requests:", err); }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://192.168.1.4:5000/api/admin/users', authConfig);
            setUsers(res.data);
        } catch (err) { console.error("Erorr users list:", err); }
    };

    const handleApproval = async (id, action) => {
        try {
            await axios.put(`http://192.168.1.4:5000/api/admin/upgrade-requests/${id}`, { status: action }, authConfig);
            alert(`Cerere ${action} cu succes!`);
            fetchUpgradeRequests();
        } catch (err) { alert('Eroare la procesare.'); }
    };

    const selectUserForEdit = (user) => {
        setSelectedUser(user);
        setEditFormData({
            username: user.username,
            email: user.email,
            age: user.age,
            role: user.role
        });
        setPasswordFormData({ newPassword: '' });
    };

    const handleBlockToggle = async (userId, currentBlockStatus) => {
        try {
            await axios.put(
                `http://192.168.1.4:5000/api/admin/users/${userId}/toggle-block`,
                { is_blocked: !currentBlockStatus },
                authConfig
            );
            alert(currentBlockStatus ? 'Utilizator deblocat!' : 'Utilizator blocat!');
            fetchUsers();
            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser({ ...selectedUser, is_blocked: !currentBlockStatus });
            }
        } catch (err) { alert('Eroare la modificarea stării blocării.'); }
    };

    const handlePasswordChange = async () => {
        if (!passwordFormData.newPassword || passwordFormData.newPassword.length < 6) {
            alert('Parola trebuie să aibă cel puțin 6 caractere.');
            return;
        }
        try {
            await axios.put(
                `http://192.168.1.4:5000/api/admin/users/${selectedUser.id}/change-password`,
                { newPassword: passwordFormData.newPassword },
                authConfig
            );
            alert('Parolă schimbată cu succes!');
            setPasswordFormData({ newPassword: '' });
        } catch (err) { alert('Eroare la schimbarea parolei.'); }
    };

    const handleUserUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `http://192.168.1.4:5000/api/admin/users/${selectedUser.id}/update`,
                editFormData,
                authConfig
            );
            alert('Datele utilizatorului actualizate!');
            fetchUsers();
            setSelectedUser(null);
        } catch (err) {
            alert(err.response?.data?.error || 'Eroare la actualizare.');
        }
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handlePasswordFormChange = (e) => {
        const { value } = e.target;
        setPasswordFormData({ newPassword: value });
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Panou Administrator</h2>

            {/* CERERI UPGRADE */}
            <section style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                <h3>📋 Cereri Upgrade Amator → Expert</h3>
                {requests.length === 0 ? (
                    <p>Nu sunt cereri în așteptare.</p>
                ) : (
                    <ul>
                        {requests.map(req => (
                            <li key={req.id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#fff', borderLeft: '3px solid #007bff' }}>
                                <strong>User ID: {req.user_id}</strong> - Status: {req.status}
                                {req.status === 'PENDING' && (
                                    <>
                                        <button onClick={() => handleApproval(req.id, 'APPROVED')} style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Aprobă</button>
                                        <button onClick={() => handleApproval(req.id, 'REJECTED')} style={{ marginLeft: '5px', padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Respinge</button>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* LISTA UTILIZATORI */}
            <section style={{ marginBottom: '30px' }}>
                <h3>👥 Toți Utilizatorii SPICE</h3>
                <table border="1" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th style={{ padding: '10px' }}>ID</th>
                            <th style={{ padding: '10px' }}>Username</th>
                            <th style={{ padding: '10px' }}>Email</th>
                            <th style={{ padding: '10px' }}>Rol</th>
                            <th style={{ padding: '10px' }}>Status</th>
                            <th style={{ padding: '10px' }}>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ backgroundColor: user.is_blocked ? '#ffe0e0' : 'white' }}>
                                <td style={{ padding: '10px' }}>{user.id}</td>
                                <td style={{ padding: '10px' }}>{user.username}</td>
                                <td style={{ padding: '10px' }}>{user.email}</td>
                                <td style={{ padding: '10px' }}>{user.role}</td>
                                <td style={{ padding: '10px', fontWeight: 'bold', color: user.is_blocked ? 'red' : 'green' }}>
                                    {user.is_blocked ? 'Blocat' : '✓ Activ'}
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <button
                                        onClick={() => selectUserForEdit(user)}
                                        style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                    >
                                        Detalii
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* MODAL DETALII UTILIZATOR */}
            {selectedUser && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3>Detalii Utilizator - {selectedUser.username}</h3>

                        {/* INFORMAȚII GENERALE */}
                        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                            <p><strong>ID:</strong> {selectedUser.id}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Vârstă:</strong> {selectedUser.age}</p>
                            <p><strong>Rol:</strong> {selectedUser.role}</p>
                            <p><strong>Verificat:</strong> {selectedUser.is_verified ? 'Da' : 'Nu'}</p>
                            <p><strong>Status:</strong> {selectedUser.is_blocked ? 'Blocat' : 'Activ'}</p>
                            <p><strong>Data Creării:</strong> {new Date(selectedUser.created_at).toLocaleDateString('ro-RO')}</p>
                        </div>

                        {/* BLOCARE/DEBLOCARE */}
                        <div style={{ marginBottom: '20px' }}>
                            <button
                                onClick={() => handleBlockToggle(selectedUser.id, selectedUser.is_blocked)}
                                style={{
                                    padding: '10px 15px',
                                    backgroundColor: selectedUser.is_blocked ? '#28a745' : '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    width: '100%',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {selectedUser.is_blocked ? 'Deblochează' : 'Blochează'} Utilizator
                            </button>
                        </div>

                        {/* SCHIMBARE PAROLĂ */}
                        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
                            <h4>Schimbă Parolă</h4>
                            <input
                                type="password"
                                placeholder="Introduceți parola nouă"
                                value={passwordFormData.newPassword}
                                onChange={handlePasswordFormChange}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    marginBottom: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '3px',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <button
                                onClick={handlePasswordChange}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#ffc107',
                                    color: 'black',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    width: '100%'
                                }}
                            >
                                Actualizează Parolă
                            </button>
                        </div>

                        {/* EDITARE DATE */}
                        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '5px' }}>
                            <h4>Editează Date Utilizator</h4>
                            <form onSubmit={handleUserUpdate}>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Username:</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={editFormData.username}
                                        onChange={handleEditFormChange}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '3px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editFormData.email}
                                        onChange={handleEditFormChange}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '3px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Vârstă:</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={editFormData.age}
                                        onChange={handleEditFormChange}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '3px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Rol:</label>
                                    <select
                                        name="role"
                                        value={editFormData.role}
                                        onChange={handleEditFormChange}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '3px',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value="AMATOR">AMATOR</option>
                                        <option value="EXPERT">EXPERT</option>
                                        <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '10px 15px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        width: '100%',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Salvează Modificări
                                </button>
                            </form>
                        </div>

                        {/* BUTON ÎNCHIDERE */}
                        <button
                            onClick={() => setSelectedUser(null)}
                            style={{
                                padding: '10px 15px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Închide
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}