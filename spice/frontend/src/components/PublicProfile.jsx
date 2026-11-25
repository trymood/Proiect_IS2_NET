import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

export default function PublicProfile() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    
    const token = localStorage.getItem('spice_token');
    const currentUserId = localStorage.getItem('userId');
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };

    // TRUC: Folosim hostname-ul dinamic pentru a merge perfect pe orice dispozitiv/rețea!
    const baseUrl = `http://${window.location.hostname}:5000`;

    useEffect(() => {
        if (!token) {
            navigate('/auth');
            return;
        }
        fetchUserData();
        checkIfFollowing();
    }, [id, token]);

    const fetchUserData = async () => {
        try {
            const res = await axios.get(`${baseUrl}/api/admin/users/${id}`, authConfig);
            setUser(res.data);
        } catch (err) {
            console.error("Error loading user data:", err);
        }
    };

    const checkIfFollowing = async () => {
        try {
            const res = await axios.get(`${baseUrl}/api/users/${id}/followers`, authConfig);
            const following = res.data.some(follower => follower.id.toString() === currentUserId);
            setIsFollowing(following);
        } catch (err) {
            console.error("Error checking followers:", err);
        }
    };

    const handleFollowToggle = async () => {
        try {
            if (isFollowing) {
                await axios.delete(`${baseUrl}/api/users/${id}/unfollow`, authConfig);
                setIsFollowing(false);
            } else {
                await axios.post(`${baseUrl}/api/users/${id}/follow`, {}, authConfig);
                setIsFollowing(true);
            }
        } catch (err) {
            alert(err.response?.data?.error || "Error updating follow status.");
        }
    };

    if (!user) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

    return (
        <div>
            <header className="navbar">
                <div className="nav-container">
                    <h1 className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>SPICE</h1>
                    <nav className="nav-links">
                        <span className="nav-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Back to Feed</span>
                    </nav>
                </div>
            </header>

            <div className="app-container" style={{ display: 'block', maxWidth: '600px', margin: '0 auto', paddingTop: '20px' }}>
                <div className="profile-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
                    <div className="profile-avatar" style={{ 
                        width: '100px', height: '100px',
                        backgroundImage: user.profile_pic ? `url(${user.profile_pic})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '50%'
                    }}>
                        {!user.profile_pic && <span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '14px'}}>No Pic</span>}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: '0 0 5px 0' }}>{user.username}</h2>
                        <p className="text-muted" style={{ margin: 0 }}>Rol: {user.role}</p>
                        
                        {/* AICI ESTE MODIFICAREA: Ambele butoane sunt grupate frumos */}
                        {currentUserId !== id && (
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button 
                                    className={isFollowing ? "btn-secondary" : "btn-primary"} 
                                    onClick={handleFollowToggle}
                                    style={{ padding: '8px 15px' }}
                                >
                                    {isFollowing ? ' Unfollow' : ' Follow'}
                                </button>
                                
                                <button 
                                    className="btn-primary" 
                                    onClick={() => navigate(`/chat/${user.id}`)}
                                    style={{ backgroundColor: '#4ecdc4', borderColor: '#4ecdc4', display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px' }}
                                >
                                     Send Message
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}