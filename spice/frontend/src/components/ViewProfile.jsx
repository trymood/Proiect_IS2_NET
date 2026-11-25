import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg'; // <-- ACEST IMPORT LIPSEA
import '../App.css';

export default function ViewProfile() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    
    const [expandedComments, setExpandedComments] = useState({});
    const [postComments, setPostComments] = useState({});
    const [commentInputs, setCommentInputs] = useState({});

    const isOwnProfile = !id; 
    const token = localStorage.getItem('spice_token');
    
    const authConfig = useMemo(() => {
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    }, [token]);

    // IP Dinamic pentru a rula perfect pe orice rețea
    const baseUrl = `http://${window.location.hostname}:5000`;

    const fetchUserPosts = useCallback(async () => {
        try {
            const postsUrl = isOwnProfile 
                ? `${baseUrl}/api/posts/user` 
                : `${baseUrl}/api/posts/user/${id}`;
            const postsRes = await axios.get(postsUrl, authConfig);
            setUserPosts(postsRes.data);
        } catch (err) {
            console.error("Error loading posts", err);
        }
    }, [isOwnProfile, id, authConfig, baseUrl]);

    const fetchProfileData = useCallback(async () => {
        try {
            const profileUrl = isOwnProfile 
                ? `${baseUrl}/api/users/me` 
                : `${baseUrl}/api/users/${id}`;
            
            const res = await axios.get(profileUrl, authConfig);
            setUserData(res.data);
            fetchUserPosts();
        } catch (err) {
            console.error("Error loading profile data", err);
        }
    }, [isOwnProfile, id, authConfig, fetchUserPosts, baseUrl]);

    useEffect(() => {
        if (!token) {
            navigate('/auth');
            return;
        } 
        fetchProfileData();
    }, [id, token, navigate, fetchProfileData]);

    const handleFollowToggle = async () => {
        try {
            if (userData.is_following) {
                await axios.post(`${baseUrl}/api/users/${id}/unfollow`, {}, authConfig);
            } else {
                await axios.post(`${baseUrl}/api/users/${id}/follow`, {}, authConfig);
            }
            fetchProfileData(); 
        } catch (err) {
            alert("Error processing request.");
        }
    };

    const handleLike = async (postId) => {
        try {
            await axios.post(`${baseUrl}/api/posts/${postId}/like`, {}, authConfig);
            fetchUserPosts(); 
        } catch (err) { console.error("Error liking post", err); }
    };

    const handleSave = async (postId) => {
        try {
            await axios.post(`${baseUrl}/api/posts/${postId}/save`, {}, authConfig);
            fetchUserPosts(); 
        } catch (err) { console.error("Error saving post", err); }
    };

    const handleToggleComments = async (postId) => {
        const isExpanded = expandedComments[postId];
        setExpandedComments(prev => ({ ...prev, [postId]: !isExpanded }));

        if (!isExpanded) {
            try {
                const res = await axios.get(`${baseUrl}/api/posts/${postId}/comments`, authConfig);
                setPostComments(prev => ({ ...prev, [postId]: res.data }));
            } catch (err) { console.error("Error loading comments", err); }
        }
    };

    const handleAddComment = async (postId) => {
        const content = commentInputs[postId];
        if (!content || !content.trim()) return;

        try {
            await axios.post(`${baseUrl}/api/posts/${postId}/comments`, { content }, authConfig);
            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
            const res = await axios.get(`${baseUrl}/api/posts/${postId}/comments`, authConfig);
            setPostComments(prev => ({ ...prev, [postId]: res.data }));
        } catch (err) { console.error("Error adding comment", err); }
    };

    if (!userData) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
    }

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
                        {/* ------------------------ */}
            
                        <input type="text" className="search-bar" placeholder="Caută rețete și utilizatori..." onClick={() => navigate('/search')} />
                        <nav className="nav-links">
                            <button className="btn-primary" onClick={() => navigate('/add-post')}>Postează Rețetă</button>
                        </nav>
                </div>
            </header>

            <div className="app-container" style={{ display: 'block', maxWidth: '800px', margin: '2rem auto' }}>
                <div className="profile-card" style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', 
                    marginBottom: '2rem', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}>
                    <div className="profile-avatar" style={{ 
                        marginBottom: '1rem', width: '120px', height: '120px',
                        backgroundImage: userData.profile_pic ? `url(${userData.profile_pic})` : 'none',
                        backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#ccc',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#666', borderRadius: '50%'
                    }}>
                        {!userData.profile_pic && "No Pic"}
                    </div>

                    <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{userData.username}</h2>
                    {isOwnProfile && <p style={{ color: 'var(--text-muted)', margin: '0 0 5px 0' }}>Email: {userData.email}</p>}
                    
                    <p style={{ color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
                        Rank: <strong>{userData.role}</strong> | Age: {userData.age}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', width: '100%', maxWidth: '300px' }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{userData.followers || 0}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Followers</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{userData.following || 0}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Follow</div>
                        </div>
                    </div>

                    {/* BUTOANELE DE ACȚIUNE */}
                    {isOwnProfile ? (
                        <button className="btn-secondary" onClick={() => navigate('/profile')} style={{ width: '100%', maxWidth: '250px' }}>
                            Profile Settings
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '350px' }}>
                            <button 
                                className={userData.is_following ? "btn-secondary" : "btn-primary"} 
                                onClick={handleFollowToggle} 
                                style={{ flex: 1 }}
                            >
                                {userData.is_following ? " Unfollow" : " Follow"}
                            </button>
                            
                            {/* Butonul TĂU de Mesaj! */}
                            <button 
                                className="btn-primary" 
                                onClick={() => navigate(`/chat/${userData.id}`)}
                                style={{ backgroundColor: '#4ecdc4', borderColor: '#4ecdc4', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                            >
                                 Mesaj
                            </button>
                        </div>
                    )}
                </div>

                {/* Restul codului pentru postări rămâne neschimbat... */}
                <h3>{isOwnProfile ? "My Recipes" : `Recipes by ${userData.username}`}</h3>
                <hr style={{ border: 'none', borderBottom: '1px solid #ccc', margin: '1rem 0' }} />
                
                {userPosts.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No recipes posted yet.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                        {userPosts.map(post => (
                            <article key={post.id} className="post" style={{ marginBottom: 0 }}>
                                <div className="post-content" style={{ paddingTop: '15px' }}>
                                    <h2 className="recipe-title" style={{ marginTop: 0 }}>{post.title}</h2>
                                    <p className="recipe-desc">{post.content}</p> 
                                    {post.image_url && ( 
                                        <div className="post-image" style={{ marginTop: '15px' }}>
                                            <img src={post.image_url} alt="Post" style={{ width: '100%', borderRadius: '10px' }} />
                                        </div>
                                    )}
                                </div>

                                <div className="post-actions" style={{ borderTop: '1px solid #eee', marginTop: '15px', paddingTop: '10px' }}>
                                    <button 
                                        className="action-btn" 
                                        onClick={() => handleLike(post.id)}
                                        style={{ color: post.is_liked ? '#ff6b6b' : 'inherit', fontWeight: post.is_liked ? 'bold' : 'normal' }}
                                    >
                                        {post.is_liked ? ' Liked' : ' Like'} ({post.likes_count || 0})
                                    </button>
                                    
                                    <button className="action-btn" onClick={() => handleToggleComments(post.id)}>
                                         Comment
                                    </button>
                                    
                                    <button 
                                        className="action-btn"
                                        onClick={() => handleSave(post.id)}
                                        style={{ color: post.is_saved ? '#4ecdc4' : 'inherit', fontWeight: post.is_saved ? 'bold' : 'normal' }}
                                    >
                                        {post.is_saved ? ' Saved' : ' Save'}
                                    </button>
                                </div>

                                {expandedComments[post.id] && (
                                    <div className="comments-section" style={{ padding: '15px', borderTop: '1px solid #eee', backgroundColor: '#fafafa' }}>
                                        <div className="comments-list" style={{ marginBottom: '15px', maxHeight: '200px', overflowY: 'auto' }}>
                                            {(postComments[post.id] || []).map(comment => (
                                                <div key={comment.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#ccc', backgroundImage: comment.profile_pic ? `url(${comment.profile_pic})` : 'none', backgroundSize: 'cover', flexShrink: 0 }}></div>
                                                    <div style={{ backgroundColor: '#fff', padding: '8px 12px', borderRadius: '15px', border: '1px solid #eee', flex: 1, textAlign: 'left' }}>
                                                        <strong style={{ fontSize: '13px' }}>{comment.username}</strong>
                                                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', wordBreak: 'break-word' }}>{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(postComments[post.id] || []).length === 0 && (
                                                <p style={{ fontSize: '13px', color: '#888', textAlign: 'center' }}>Be the first to comment!</p>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input 
                                                type="text" 
                                                placeholder="Scrie un comentariu..." 
                                                value={commentInputs[post.id] || ''}
                                                onChange={(e) => setCommentInputs(prev => ({...prev, [post.id]: e.target.value}))}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                                                style={{ flex: 1, padding: '10px 15px', borderRadius: '20px', border: '1px solid #ccc', outline: 'none' }}
                                            />
                                            <button className="btn-primary" style={{ padding: '0 20px', borderRadius: '20px' }} onClick={() => handleAddComment(post.id)}>
                                                Trimite
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}