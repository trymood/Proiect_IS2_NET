import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg'; 
import '../App.css';

export default function AddPost() {
    const navigate = useNavigate();
    const token = localStorage.getItem('spice_token');
    
    // Am modificat 'description' în 'content' pentru a se potrivi cu baza de date
    const [postData, setPostData] = useState({ title: '', content: '' });
    const [imageFile, setImageFile] = useState(null); 
    const [imagePreview, setImagePreview] = useState(null); 
    const [error, setError] = useState('');

    // IP DINAMIC
    const baseUrl = `http://${window.location.hostname}:5000`;

    useEffect(() => {
        if (!token) {
            navigate('/auth');
        }
    }, [token, navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', postData.title);
            formData.append('content', postData.content); // Aici trimitem 'content'
            formData.append('post_type', 'GENERAL'); // Baza de date cere un tip de postare
            
            if (imageFile) {
                formData.append('image', imageFile); 
            }

            // Am corectat ruta către /api/posts/create
            await axios.post(`${baseUrl}/api/posts/create`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' 
                }
            });
            
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Eroare la adăugarea postării.');
        }
    };

    return (
        <div>
            <header className="navbar">
                <div className="nav-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <img 
                        src={logo} 
                        alt="Spice Logo" 
                        className="logo-img" 
                        onClick={() => navigate('/')} 
                    />
                    <input type="text" className="search-bar" placeholder="Search recipes and users..." onClick={() => navigate('/search')} />
                    <nav className="nav-links">
                        <button className="btn-primary" onClick={() => navigate('/add-post')}>Post Recipe</button>
                    </nav>
                </div>
            </header>

            <div className="auth-body" style={{ minHeight: 'calc(100vh - 70px)', alignItems: 'flex-start', paddingTop: '50px' }}>
                <div className="auth-container" style={{ maxWidth: '600px' }}>
                    <div className="auth-card" style={{ textAlign: 'left' }}>
                        <h2>Create New Post</h2>
                        <p className="auth-subtitle">Share your latest culinary creation</p>

                        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Recipe Title</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    required 
                                    value={postData.title}
                                    onChange={(e) => setPostData({...postData, title: e.target.value})} 
                                />
                            </div>

                            <div className="form-group">
                                <label>Description & Steps</label>
                                <textarea 
                                    className="form-control" 
                                    rows="4" 
                                    required
                                    value={postData.content}
                                    onChange={(e) => setPostData({...postData, content: e.target.value})} 
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>Upload Image</label>
                                <input 
                                    type="file" 
                                    className="form-control" 
                                    accept="image/*" 
                                    onChange={handleImageChange} 
                                />
                                {imagePreview && (
                                    <div style={{ marginTop: '10px' }}>
                                        <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '10px' }} />
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="btn-primary auth-btn">Publish Recipe</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}