import React, { useState, useEffect, useMemo, useCallback } from 'react'; // <-- AM ADĂUGAT useMemo, useCallback AICI!
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom'; // <-- AM ADĂUGAT useSearchParams AICI!
import logo from '../assets/logo.svg'; 
import '../App.css';

export default function SearchUsers() {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlQuery = searchParams.get('q') || ''; 
    
    const [query, setQuery] = useState(urlQuery);
    const [searchType, setSearchType] = useState('users'); // 'users' sau 'recipes'
    const [userResults, setUserResults] = useState([]);
    const [recipeResults, setRecipeResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const navigate = useNavigate();

    // STATE-URI PENTRU COMENTARIILE DIN REȚETE
    const [expandedComments, setExpandedComments] = useState({});
    const [postComments, setPostComments] = useState({});
    const [commentInputs, setCommentInputs] = useState({});

    const token = localStorage.getItem('spice_token');
    const authConfig = useMemo(() => {
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}, [token]);

    const fetchResults = useCallback(async (searchStr, type) => {
        if (!searchStr.trim()) return;
        try {
            if (type === 'users') {
                const res = await axios.get(`http://192.168.1.4:5000/api/users/search/users?q=${searchStr}`, authConfig);
                setUserResults(res.data);
            } else {
                const res = await axios.get(`http://192.168.1.4:5000/api/posts/search?q=${searchStr}`, authConfig);
                setRecipeResults(res.data);
            }
            setHasSearched(true);
        } catch (err) {
            console.error("Search error:", err);
        }
    }, [authConfig]);

    useEffect(() => {
        if (!token) navigate('/auth');
        if (urlQuery) {
            setQuery(urlQuery);
            fetchResults(urlQuery, searchType);
        }
    }, [token, navigate, urlQuery, searchType, fetchResults]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            setSearchParams({ q: query });
            fetchResults(query, searchType);
        }
    };

    const handleTabChange = (type) => {
        setSearchType(type);
        setHasSearched(false);
        if (query.trim()) {
            fetchResults(query, type);
        }
    };

    // --- FUNCȚII PENTRU INTERACȚIUNI REȚETE ---
    const handleLike = async (postId) => {
        try {
            await axios.post(`http://192.168.1.4:5000/api/posts/${postId}/like`, {}, authConfig);
            fetchResults(query, 'recipes'); 
        } catch (err) { console.error("Like error:", err); }
    };

    const handleSave = async (postId) => {
        try {
            await axios.post(`http://192.168.1.4:5000/api/posts/${postId}/save`, {}, authConfig);
            fetchResults(query, 'recipes'); 
        } catch (err) { console.error("Save error:", err); }
    };

    const handleToggleComments = async (postId) => {
        const isExpanded = expandedComments[postId];
        setExpandedComments(prev => ({ ...prev, [postId]: !isExpanded }));
        if (!isExpanded) {
            try {
                const res = await axios.get(`http://192.168.1.4:5000/api/posts/${postId}/comments`, authConfig);
                setPostComments(prev => ({ ...prev, [postId]: res.data }));
            } catch (err) { console.error("Comment loading error:", err); }
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
        } catch (err) { console.error("Comment adding error:", err); }
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

            <div className="app-container" style={{ maxWidth: '600px', marginTop: '20px', display: 'block' }}>
                <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Explore SPICE</h2>
                
                {/* BARA DE CĂUTARE */}
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input 
                        type="text" 
                        placeholder={searchType === 'users' ? "Search cooks..." : "Search recipes or ingredients..."} 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ccc', fontSize: '16px' }}
                    />
                    <button type="submit" className="btn-primary" style={{ borderRadius: '25px', padding: '0 20px' }}>
                        Search
                    </button>
                </form>

                {/* TAB-URI */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
                    <button 
                        onClick={() => handleTabChange('users')}
                        className={searchType === 'users' ? "btn-primary" : "btn-secondary"}
                        style={{ borderRadius: '20px', padding: '8px 20px' }}
                    >
                         Cooks
                    </button>
                    <button 
                        onClick={() => handleTabChange('recipes')}
                        className={searchType === 'recipes' ? "btn-primary" : "btn-secondary"}
                        style={{ borderRadius: '20px', padding: '8px 20px' }}
                    >
                         Recipes
                    </button>
                </div>

                {/* REZULTATE BUCĂTARI */}
                {searchType === 'users' && (
                    <div className="search-results">
                        {hasSearched && userResults.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#666' }}>No cooks found.</p>
                        )}
                        {userResults.map(user => (
                            <div 
                                key={user.id} className="profile-card" 
                                style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', marginBottom: '10px', cursor: 'pointer' }} 
                                onClick={() => navigate(`/user/${user.id}`)}
                            >
                                <div style={{ 
                                    backgroundImage: user.profile_pic ? `url(${user.profile_pic})` : 'none',
                                    backgroundSize: 'cover', backgroundColor: '#ccc',
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px'
                                }}>
                                    {!user.profile_pic && 'No Pic'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: '18px' }}>{user.username}</h3>
                                    <span style={{ fontSize: '13px', color: 'var(--secondary-color)', fontWeight: 'bold' }}>{user.role}</span>
                                </div>
                                <button className="btn-secondary">View Profile</button>
                            </div>
                        ))}
                    </div>
                )}

                {/* REZULTATE REȚETE */}
                {searchType === 'recipes' && (
                    <div className="feed" style={{ width: '100%' }}>
                        {hasSearched && recipeResults.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#666' }}>No recipes found.</p>
                        )}
                        {recipeResults.map(post => (
                            <article key={post.id} className="post" style={{ marginBottom: '20px' }}>
                                <div className="post-header">
                                    {/* 1. MODIFICARE: Am adăugat onClick și cursor: 'pointer' pe avatar */}
                                    <div className="post-avatar" style={{ 
                                        backgroundImage: post.profile_pic ? `url(${post.profile_pic})` : 'none',
                                        backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#ccc',
                                        cursor: 'pointer'
                                    }} onClick={() => navigate(`/user/${post.user_id}`)}></div>
                                    
                                    <div className="post-meta">
                                        <h3 style={{ cursor: 'pointer' }} onClick={() => navigate(`/user/${post.user_id}`)}>{post.username}</h3>
                                        <span className="timestamp">{new Date(post.created_at).toLocaleString('ro-RO')}</span>
                                    </div>
                                </div>
                                
                                {/* 2. MODIFICARE: Am adăugat display: 'flex' și flexDirection: 'column' pentru a nu se mai suprapune textul cu imaginea */}
                                <div className="post-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px' }}>
                                    <h2 className="recipe-title" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{post.title}</h2>
                                    <p className="recipe-desc" style={{ margin: 0, color: '#555' }}>{post.content}</p>
                                    
                                    {post.image_url && (
                                        <div className="post-image" style={{ width: '100%', marginTop: '5px' }}>
                                            {/* 3. MODIFICARE: Am asigurat display: 'block' și height: 'auto' pe imagine */}
                                            <img src={post.image_url} alt="Postare" style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }} />
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
                                    <button className="action-btn" onClick={() => navigate(`/post/${post.id}`)} style={{ color: 'var(--primary-color)', fontWeight: 'bold' }} >
                                          View Recipe
                                     </button>
                                </div>

                                {expandedComments[post.id] && (
                                    <div className="comments-section" style={{ padding: '15px', backgroundColor: '#fafafa' }}>
                                        <div className="comments-list" style={{ marginBottom: '15px', maxHeight: '200px', overflowY: 'auto' }}>
                                            {(postComments[post.id] || []).map(comment => (
                                                <div key={comment.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                                    {/* MODIFICARE: Navigare din comentarii pe profil */}
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#ccc', backgroundImage: comment.profile_pic ? `url(${comment.profile_pic})` : 'none', backgroundSize: 'cover', flexShrink: 0, cursor: 'pointer' }} onClick={() => navigate(`/user/${comment.user_id}`)}></div>
                                                    <div style={{ backgroundColor: '#fff', padding: '8px 12px', borderRadius: '15px', border: '1px solid #eee', flex: 1, textAlign: 'left' }}>
                                                        <strong style={{ fontSize: '13px', cursor: 'pointer' }} onClick={() => navigate(`/user/${comment.user_id}`)}>{comment.username}</strong>
                                                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', wordBreak: 'break-word' }}>{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(postComments[post.id] || []).length === 0 && <p style={{ fontSize: '13px', color: '#888', textAlign: 'center' }}>Fii primul care comentează!</p>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input 
                                                type="text" placeholder="Scrie un comentariu..." value={commentInputs[post.id] || ''}
                                                onChange={(e) => setCommentInputs(prev => ({...prev, [post.id]: e.target.value}))}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                                                style={{ flex: 1, padding: '10px 15px', borderRadius: '20px', border: '1px solid #ccc', outline: 'none' }}
                                            />
                                            <button className="btn-primary" style={{ padding: '0 20px', borderRadius: '20px' }} onClick={() => handleAddComment(post.id)}>Trimite</button>
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