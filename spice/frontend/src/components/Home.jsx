import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.svg';
import '../App.css';

export default function Home() {
    const [currentUser, setCurrentUser] = useState(null);
    const [posts, setPosts] = useState([]); 
    const navigate = useNavigate();
    
    const [expandedComments, setExpandedComments] = useState({});
    const [postComments, setPostComments] = useState({});
    const [commentInputs, setCommentInputs] = useState({});

    const token = localStorage.getItem('spice_token');
    
    const authConfig = useMemo(() => {
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    }, [token]);

    const [navSearchQuery, setNavSearchQuery] = useState('');

    // IP DINAMIC: Se adaptează automat!
    const baseUrl = `http://${window.location.hostname}:5000`;

    const handleNavSearch = (e) => {
        e.preventDefault();
        if (navSearchQuery.trim()) {
            navigate(`/search?q=${navSearchQuery}`);
        }
    };

    const fetchFeedPosts = useCallback(async () => {
        try {
            const res = await axios.get(`${baseUrl}/api/posts/feed`, authConfig);
            setPosts(res.data);
        } catch (err) {
            console.error("Error fetching feed:", err);
        }
    }, [authConfig, baseUrl]);

    useEffect(() => {
        if (!token) {
            navigate('/auth');
            return;
        }

        axios.get(`${baseUrl}/api/users/me`, authConfig)
            .then(res => setCurrentUser(res.data))
            .catch(err => {
                console.error("Error fetching user data:", err);
                if (err.response && err.response.status === 401) {
                    handleLogout();
                }
            });

        fetchFeedPosts();
        
    }, [token, navigate, fetchFeedPosts, baseUrl]);

    const handleLogout = () => {
        localStorage.removeItem('spice_token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        setCurrentUser(null);
        navigate('/auth');
    };

    // INTERACTIONS
    const handleLike = async (postId) => {
        try {
            await axios.post(`${baseUrl}/api/posts/${postId}/like`, {}, authConfig);
            fetchFeedPosts(); 
        } catch (err) { console.error("Error on Like", err); }
    };

    const handleSave = async (postId) => {
        try {
            await axios.post(`${baseUrl}/api/posts/${postId}/save`, {}, authConfig);
            fetchFeedPosts(); 
        } catch (err) { console.error("Error on Save", err); }
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

            <div className="app-container">
                <aside className="sidebar-left">
                    <div className="profile-card">
                        <div className="profile-avatar" style={{ 
                            backgroundImage: currentUser?.profile_pic ? `url(${currentUser.profile_pic})` : 'none',
                            backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#ccc',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#666'
                        }}>
                            {!currentUser?.profile_pic && "No Pic"}
                        </div>

                        <h2>{currentUser ? currentUser.username : 'Visitor'}</h2>
                        
                        <ul className="sidebar-menu">
                            {token ? (
                                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/view-profile'); }}>View Profile</a></li>
                            ) : (
                                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/auth'); }}>Log in</a></li>
                            )}
                            
                            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/saved-recipes'); }}>Saved Recipes</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/chat'); }}> Messages</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/groups'); }}> Communities</a></li>
                            
                            {token && (
                                <li><a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: 'red', fontWeight: 'bold' }}> Log out</a></li>
                            )}
                        </ul>
                    </div>
                </aside>

                <main className="feed">
                    {token && (
                        <div className="create-post" onClick={() => navigate('/add-post')} style={{ cursor: 'pointer', marginBottom: '20px' }}>
                            <input 
                                type="text" 
                                placeholder={`What are you cooking today, ${currentUser?.username || 'Chef'}?`} 
                                readOnly 
                                style={{ cursor: 'pointer' }}
                            />
                            <button className="btn-secondary">Add Photo</button>
                        </div>
                    )}

                    {!token ? (
                        <p style={{ textAlign: 'center', color: '#666' }}>Log in to see the latest updates.</p>
                    ) : posts.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#666' }}>Your feed is empty. Post a recipe or follow other chefs!</p>
                    ) : (
                        posts.map(post => (
                            <article key={post.id} className="post" style={{ marginBottom: '20px' }}>
                                <div className="post-header">
                                    <div className="post-avatar" style={{ 
                                        backgroundImage: post.profile_pic ? `url(${post.profile_pic})` : 'none',
                                        backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#ccc', cursor: 'pointer'
                                    }} onClick={() => navigate(`/user/${post.user_id}`)}></div>
                                    <div className="post-meta">
                                        <h3 style={{ cursor: 'pointer' }} onClick={() => navigate(`/user/${post.user_id}`)}>{post.username}</h3>
                                        <span className="timestamp">{new Date(post.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                    </div>
                                </div>
                                <div className="post-content">
                                    <h2 className="recipe-title">{post.title}</h2>
                                    <p className="recipe-desc">{post.content}</p>
                                    {post.image_url && (
                                        <div className="post-image" style={{ marginTop: '15px' }}>
                                            <img src={post.image_url} alt="Post" style={{ width: '100%', borderRadius: '10px' }} />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="post-actions" style={{ borderTop: '1px solid #eee', marginTop: '15px', paddingTop: '10px' }}>
                                    <button 
                                        className="action-btn" onClick={() => handleLike(post.id)}
                                        style={{ color: post.is_liked ? '#ff6b6b' : 'inherit', fontWeight: post.is_liked ? 'bold' : 'normal' }}
                                    >
                                        {post.is_liked ? ' Liked' : ' Like'} ({post.likes_count || 0})
                                    </button>
                                    <button className="action-btn" onClick={() => handleToggleComments(post.id)}> Comment</button>
                                    <button 
                                        className="action-btn" onClick={() => handleSave(post.id)}
                                        style={{ color: post.is_saved ? '#4ecdc4' : 'inherit', fontWeight: post.is_saved ? 'bold' : 'normal' }}
                                    >
                                        {post.is_saved ? ' Saved' : ' Save'}
                                    </button>
                                </div>

                                {expandedComments[post.id] && (
                                    <div className="comments-section" style={{ padding: '15px', borderTop: '1px solid #eee', backgroundColor: '#fafafa', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}>
                                        <div className="comments-list" style={{ marginBottom: '15px', maxHeight: '200px', overflowY: 'auto' }}>
                                            {(postComments[post.id] || []).map(comment => (
                                                <div key={comment.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#ccc', backgroundImage: comment.profile_pic ? `url(${comment.profile_pic})` : 'none', backgroundSize: 'cover', flexShrink: 0 }}></div>
                                                    <div style={{ backgroundColor: '#fff', padding: '8px 12px', borderRadius: '15px', border: '1px solid #eee', flex: 1 }}>
                                                        <strong style={{ fontSize: '13px', cursor: 'pointer' }} onClick={() => navigate(`/user/${comment.user_id}`)}>{comment.username}</strong>
                                                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', wordBreak: 'break-word' }}>{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(postComments[post.id] || []).length === 0 && <p style={{ fontSize: '13px', color: '#888', textAlign: 'center' }}>Be the first to comment!</p>}
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input 
                                                type="text" placeholder="Write a comment..." value={commentInputs[post.id] || ''}
                                                onChange={(e) => setCommentInputs(prev => ({...prev, [post.id]: e.target.value}))}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                                                style={{ flex: 1, padding: '10px 15px', borderRadius: '20px', border: '1px solid #ccc', outline: 'none' }}
                                            />
                                            <button className="btn-primary" style={{ padding: '0 20px', borderRadius: '20px' }} onClick={() => handleAddComment(post.id)}>Send</button>
                                        </div>
                                    </div>
                                )}
                            </article>
                        )))}
                </main>
             </div>
        </div>
    );
}