import React, { useState, useEffect } from 'react'; // Doar O SINGURĂ DATĂ!
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg'; 
import '../App.css';

export default function Groups() {
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('spice_token');
    const userRole = localStorage.getItem('userRole');
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        if (!token) {
            navigate('/auth');
            return;
        }
        fetchGroups();
    }, [token, navigate]);

    const fetchGroups = async () => {
        try {
            // Presupunând că ai pus rutele de grupuri pe /api/groups în backend
            const res = await axios.get('http://192.168.1.4:5000/api/groups', authConfig);
            setGroups(res.data);
        } catch (err) {
            console.error("Error fetching groups:", err);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName) return alert("Name is required!");

        try {
            await axios.post('http://192.168.1.4:5000/api/groups', {
                name: newGroupName,
                description: newGroupDesc
            }, authConfig);
            setNewGroupName('');
            setNewGroupDesc('');
            fetchGroups(); // Reîncărcăm lista
            alert("Group created successfully!");
        } catch (err) {
            alert(err.response?.data?.error || "Error creating group.");
        }
    };

    const handleJoin = async (groupId) => {
    try {
        await axios.post(`http://192.168.1.4:5000/api/groups/${groupId}/join`, {}, authConfig);
        // După ce ne alăturăm, reîncărcăm lista de grupuri ca să apară instant "✓ Membru"
        fetchGroups(); 
    } catch (err) {
        alert(err.response?.data?.error || "Error joining group.");
    }
};

    return (
        <div>
            {/* Navigația ta standard */}
            <header className="navbar">
                <div className="nav-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <img 
                        src={logo} 
                        alt="Spice Logo" 
                        className="logo-img" 
                        onClick={() => navigate('/')} 
                    />
                    {/* ------------------------ */}

                    <input type="text" className="search-bar" placeholder="Search recipes and users..." onClick={() => navigate('/search')} />
                    <nav className="nav-links">
                        <button className="btn-primary" onClick={() => navigate('/add-post')}>Post Recipe</button>
                    </nav>
                </div>
            </header>

            <div className="app-container" style={{ display: 'block', maxWidth: '800px' }}>
                <h2 style={{ marginBottom: '20px' }}>SPICE Communities</h2>

                {/* Zona de creare grup nou folosind stilul tău de create-post */}

                {/* Zona de creare grup nou - VIZIBILĂ DOAR PENTRU EXPERȚI ȘI ADMINI */}
{(userRole === 'EXPERT' || userRole === 'ADMINISTRATOR') && (
    <div className="create-post" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <h3>Create a new group</h3>
        <input 
            type="text" 
            placeholder="Group name..." 
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
        />
        <input 
            type="text" 
            placeholder="Group description..." 
            value={newGroupDesc}
            onChange={(e) => setNewGroupDesc(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
        />
        <button className="btn-primary" onClick={handleCreateGroup}>Create Group</button>
    </div>
)}

                {/* Lista de Grupuri folosind stilul tău de post */}
                <div>
                    {groups.length === 0 ? <p>There are no groups available.</p> : groups.map(group => (
                        <div key={group.id} className="post" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 className="recipe-title">{group.name}</h2>
                                    <button className="btn-small" onClick={() => navigate(`/groups/${group.id}`)}>View Group</button>
                                    <span className="timestamp">Created by {group.creator_name}</span>
                                    <p className="recipe-desc" style={{ marginTop: '10px' }}>{group.description}</p>
                                </div>
                               {group.is_member === 0 ? (
    <button className="btn-secondary" onClick={() => handleJoin(group.id)}>Join Group</button>
) : (
    <span style={{ color: 'green', fontWeight: 'bold' }}>✓ Membru</span>
)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}