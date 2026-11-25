import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function Profile() {
    const [userData, setUserData] = useState({ username: '', age: '', profile_pic: '' });
    const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const token = localStorage.getItem('spice_token');
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        if (!token) {
            navigate('/auth');
        } else {
            axios.get('http://192.168.1.4:5000/api/users/me', authConfig)
                .then(res => setUserData(res.data))
                .catch(err => console.error("Error loading user data", err));
        }
    }, [token, navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (passwords.password && passwords.password !== passwords.confirmPassword) {
            setStatusMsg({ type: 'red', text: 'New passwords do not match!' });
            return;
        }

        try {
            await axios.put('http://192.168.1.4:5000/api/users/profile', {
                ...userData,
                password: passwords.password
            }, authConfig);
            setStatusMsg({ type: 'green', text: 'Profile updated successfully!' });
            setPasswords({ password: '', confirmPassword: '' });
        } catch (err) {
            setStatusMsg({ type: 'red', text: 'Error saving data.' });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserData({ ...userData, profile_pic: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <header className="navbar">
                <div className="nav-container">
                    <h1 className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>SPICE</h1>
                    <nav className="nav-links">
                        <button className="btn-primary" onClick={() => navigate('/')}>Back to Home</button>
                    </nav>
                </div>
            </header> 

            <div className="auth-body" style={{ minHeight: 'calc(100vh - 70px)', alignItems: 'flex-start', paddingTop: '50px' }}>
                <div className="auth-container" style={{ maxWidth: '600px' }}>
                    <div className="auth-card" style={{ textAlign: 'left' }}>
                        <h2>Profile Settings</h2>
                        <p className="auth-subtitle">Modify your SPICE account details</p>

                        {statusMsg.text && (
                            <div style={{ color: statusMsg.type, marginBottom: '20px', fontWeight: 'bold' }}>
                                {statusMsg.text}
                            </div>
                        )}

                        <form className="auth-form" onSubmit={handleUpdate}>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div className="profile-avatar" style={{ 
                                    margin: '0 auto', 
                                    backgroundImage: userData.profile_pic ? `url(${userData.profile_pic})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundColor: '#ccc'
                                }}>
                                    {!userData.profile_pic && <span style={{fontSize: '12px'}}>No Pic</span>}
                                </div>
                                <input type="file" id="fileInput" hidden onChange={handleImageChange} accept="image/*" />
                                <button type="button" className="btn-small" style={{marginTop: '10px'}} onClick={() => document.getElementById('fileInput').click()}>
                                    Change Profile Picture
                                </button>
                            </div>

                            <div className="form-group">
                                <label>Username</label>
                                <input type="text" className="form-control" value={userData.username} 
                                    onChange={(e) => setUserData({...userData, username: e.target.value})} />
                            </div>

                            <div className="form-group">
                                <label>Age</label>
                                <input type="number" className="form-control" value={userData.age} 
                                    onChange={(e) => setUserData({...userData, age: e.target.value})} />
                            </div>

                            <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #ccc' }} />
                            <h3>Security</h3>
                            <div className="form-group">
                                <label>New Password (optional)</label>
                                <input type="password" name="password" className="form-control" 
                                    value={passwords.password} placeholder="Leave blank if you don't want to change it"
                                    onChange={(e) => setPasswords({...passwords, password: e.target.value})} />
                            </div>

                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input type="password" name="confirmPassword" className="form-control" 
                                    value={passwords.confirmPassword} placeholder="Re-enter new password"
                                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} />
                            </div>

                            <button type="submit" className="btn-primary auth-btn" style={{ backgroundColor: 'var(--secondary-color)' }}>
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}