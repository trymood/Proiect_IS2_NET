import React, { useState, useEffect, useMemo } from 'react'; // <-- AM ADĂUGAT useMemo AICI!
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg'; 
import '../App.css';

export default function SavedRecipes() {
    const [savedPosts, setSavedPosts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [expandedComments, setExpandedComments] = useState({});
    const [postComments, setPostComments] = useState({});
    const [commentInputs, setCommentInputs] = useState({});

    const navigate = useNavigate();
    const token = localStorage.getItem('spice_token');

    const authConfig = useMemo(() => {
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    }, [token]);

    useEffect(() => {
        if (!token) {
            navigate('/auth');
            return;
        }

        // Date utilizator curent
        axios.get('http://192.168.1.4:5000/api/users/me', authConfig)
            .then(res => setCurrentUser(res.data))
            .catch(err => console.error(err));

        fetchSavedRecipes();
    }, [authConfig, navigate, token]);

    const fetchSavedRecipes = async () => {
        try {
            const res = await axios.get('http://192.168.1.4:5000/api/posts/saved', authConfig);
            setSavedPosts(res.data);
        } catch (err) {
            console.error("Eroare la preluarea rețetelor salvate:", err);
        }
    };

    const handleLike = async (postId) => {
        try {
            await axios.post(`http://192.168.1.4:5000/api/posts/${postId}/like`, {}, authConfig);
            fetchSavedRecipes();
        } catch (err) { console.error(err); }
    };

    const handleSave = async (postId) => {
        try {
            await axios.post(`http://192.168.1.4:5000/api/posts/${postId}/save`, {}, authConfig);
            fetchSavedRecipes(); // Va reîmprospăta lista și va elimina elementul nesalvat
        } catch (err) { console.error(err); }
    };

    const handleToggleComments = async (postId) => {
        const isExpanded = expandedComments[postId];
        setExpandedComments(prev => ({ ...prev, [postId]: !isExpanded }));
        if (!isExpanded) {
            try {
                const res = await axios.get(`http://192.168.1.4:5000/api/posts/${postId}/comments`, authConfig);
                setPostComments(prev => ({ ...prev, [postId]: res.data }));
            } catch (err) { console.error(err); }
        }
    };

    const handleAddComment = async (postId) => {
        const content = commentInputs[postId];
        if (!content || !content.trim()) return;
        try {
            await axios.post(`http://192.168.1.4:5000/api/posts/${postId}/comments`, { content }, authConfig);
            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
            const res = await axios.get(`http://192.168.1.4:5000/api/posts/${postId}/comments`, authConfig);
            setPostComments(prev => ({ ...prev, [postId]: res.data }));
        } catch (err) { console.error(err); }
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
                    {/* ------------------------ */}

                    <input type="text" className="search-bar" placeholder="Caută rețete și utilizatori..." onClick={() => navigate('/search')} />
                    <nav className="nav-links">
                        <button className="btn-primary" onClick={() => navigate('/add-post')}>Postează Rețetă</button>
                    </nav>
                </div>
            </header>

            <div className="app-container" style={{ marginTop: '20px' }}>
                <aside className="sidebar-left">
                    <div className="profile-card">
                        <div className="profile-avatar" style={{ 
                            backgroundImage: currentUser?.profile_pic ? `url(${currentUser.profile_pic})` : 'none',
                            backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#ccc',
                            width: '80px', height: '80px', margin: '0 auto 10px auto', borderRadius: '50%'
                        }}></div>
                        <h2 style={{ textAlign: 'center' }}>{currentUser?.username || 'Chef'}</h2>
                        <ul className="sidebar-menu">
                            <li><a href="#" onClick={() => navigate('/groups')}>Communities</a></li>
                            <li><a href="#" onClick={() => navigate('/search')}>Cooks & Recipes</a></li>
                        </ul>
                    </div>
                </aside>

                <main className="feed" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '20px', textAlign: 'center', color: 'var(--primary-color)' }}> Saved Recipes</h2>
                    
                    {savedPosts.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#888', marginTop: '30px' }}>
                            No saved recipes yet.
                        </p>
                    ) : (
                        savedPosts.map(post => (
                            <article key={post.id} className="post" style={{ marginBottom: '20px' }}>
                                <div className="post-header">
                                    <div className="post-avatar" style={{ 
                                        backgroundImage: post.profile_pic ? `url(${post.profile_pic})` : 'none',
                                        backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#ccc', cursor: 'pointer'
                                    }} onClick={() => navigate(`/user/${post.user_id}`)}></div>
                                    <div className="post-meta">
                                        <h3 style={{ cursor: 'pointer', margin: 0 }} onClick={() => navigate(`/user/${post.user_id}`)}>{post.username}</h3>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span className="timestamp">{new Date(post.created_at).toLocaleString('ro-RO')}</span>
                                            {post.group_name && (
                                                <span style={{ fontSize: '11px', backgroundColor: '#ff6b6b', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                                                    {post.group_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="post-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px' }}>
                                    <h2 className="recipe-title" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{post.title}</h2>
                                    <p className="recipe-desc" style={{ margin: 0, color: '#555' }}>{post.content}</p>
                                    {post.image_url && (
                                        <div className="post-image" style={{ width: '100%', marginTop: '5px' }}>
                                            <img src={post.image_url} alt="Postare" style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }} />
                                        </div>
                                    )}
                                </div>

                                <div className="post-actions" style={{ borderTop: '1px solid #eee', marginTop: '15px', paddingTop: '10px' }}>
                                    <button className="action-btn" onClick={() => handleLike(post.id)} style={{ color: post.is_liked ? '#ff6b6b' : 'inherit', fontWeight: post.is_liked ? 'bold' : 'normal' }}>
                                        {post.is_liked ? ' Liked' : ' Like'} ({post.likes_count || 0})
                                    </button>
                                    <button className="action-btn" onClick={() => handleToggleComments(post.id)}> Comment</button>
                                    <button className="action-btn" onClick={() => handleSave(post.id)} style={{ color: '#4ecdc4', fontWeight: 'bold' }}>
                                         Saved
                                    </button>
                                    <button className="action-btn" onClick={() => navigate(`/post/${post.id}`)} style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                                          View
                                    </button>
                                </div>

                                {expandedComments[post.id] && (
                                    <div className="comments-section" style={{ padding: '15px', backgroundColor: '#fafafa' }}>
                                        <div className="comments-list" style={{ marginBottom: '15px', maxHeight: '200px', overflowY: 'auto' }}>
                                            {(postComments[post.id] || []).map(comment => (
                                                <div key={comment.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#ccc', backgroundImage: comment.profile_pic ? `url(${comment.profile_pic})` : 'none', backgroundSize: 'cover', flexShrink: 0, cursor: 'pointer' }} onClick={() => navigate(`/user/${comment.user_id}`)}></div>
                                                    <div style={{ backgroundColor: '#fff', padding: '8px 12px', borderRadius: '15px', border: '1px solid #eee', flex: 1, textAlign: 'left' }}>
                                                        <strong style={{ fontSize: '13px', cursor: 'pointer' }} onClick={() => navigate(`/user/${comment.user_id}`)}>{comment.username}</strong>
                                                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', wordBreak: 'break-word' }}>{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input type="text" placeholder="Scrie un comentariu..." value={commentInputs[post.id] || ''} onChange={(e) => setCommentInputs(prev => ({...prev, [post.id]: e.target.value}))} onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }} style={{ flex: 1, padding: '10px 15px', borderRadius: '20px', border: '1px solid #ccc', outline: 'none' }} />
                                            <button className="btn-primary" style={{ padding: '0 20px', borderRadius: '20px' }} onClick={() => handleAddComment(post.id)}>Trimite</button>
                                        </div>
                                    </div>
                                )}
                            </article>
                        ))
                    )}
                </main>
            </div>
        </div>
    );
}   