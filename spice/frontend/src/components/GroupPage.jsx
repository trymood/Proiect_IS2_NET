import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom'; 
import logo from '../assets/logo.svg'; 
import '../App.css';

export default function GroupPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [posts, setPosts] = useState([]);
    
    // Variabile pentru creare postare
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newType, setNewType] = useState('GENERAL');
    const [newImageFile, setNewImageFile] = useState(null); 
    const [newImagePreview, setNewImagePreview] = useState(null); 

    // Variabile pentru Transfer Grup
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [successors, setSuccessors] = useState([]);
    const [selectedSuccessorId, setSelectedSuccessorId] = useState('');

    // State-uri pentru interacțiuni (Like, Save, Comentarii)
    const [expandedComments, setExpandedComments] = useState({});
    const [postComments, setPostComments] = useState({});
    const [commentInputs, setCommentInputs] = useState({});

    const token = localStorage.getItem('spice_token');
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };
    
    // IP Dinamic - crucial pentru mobil!
    const baseUrl = `http://${window.location.hostname}:5000`;

    useEffect(() => {
        if (!token) {
            navigate('/auth');
            return;
        }
        fetchGroupData();
        fetchPosts();
    }, [id, token]);

    const fetchGroupData = async () => {
        try {
            const res = await axios.get(`${baseUrl}/api/groups/${id}`, authConfig);
            setGroup(res.data);
        } catch (err) {
            console.error("Eroare grup:", err);
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await axios.get(`${baseUrl}/api/groups/${id}/posts`, authConfig);
            setPosts(res.data);
        } catch (err) {
            console.error("Eroare postări:", err);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImageFile(file); 
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImagePreview(reader.result); 
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newContent.trim()) return;

        const formData = new FormData();
        formData.append('title', newTitle);
        formData.append('content', newContent);
        formData.append('post_type', newType);
        
        if (newImageFile) {
            formData.append('image', newImageFile);
        }

        try {
            await axios.post(`${baseUrl}/api/groups/${id}/posts`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setNewTitle(''); setNewContent(''); setNewType('GENERAL'); 
            setNewImageFile(null); setNewImagePreview(null);
            fetchPosts(); 
        } catch (err) {
            alert(err.response?.data?.error || "Eroare la postare.");
        }
    };

    const handleJoinGroup = async () => {
        try {
            await axios.post(`${baseUrl}/api/groups/${id}/join`, {}, authConfig);
            fetchGroupData();
        } catch (err) {
            alert(err.response?.data?.error || "Eroare la alăturare.");
        }
    };

    const handleInitiateLeave = async () => {
        if (group.memberRole === 'ADMIN') {
            try {
                const res = await axios.get(`${baseUrl}/api/groups/${id}/eligible-successors`, authConfig);
                if (res.data.length === 0) {
                    alert("Nu poți părăsi grupul deoarece nu există un alt expert/admin disponibil pentru a-l prelua.");
                    return;
                }
                setSuccessors(res.data);
                setShowTransferModal(true);
            } catch (err) {
                alert("Eroare la preluarea succesorilor.");
            }
        } else {
            if (window.confirm("Ești sigur că vrei să părăsești comunitatea?")) {
                executeLeaveRequest(null);
            }
        }
    };

    const executeLeaveRequest = async (successorId) => {
        try {
            await axios.post(`${baseUrl}/api/groups/${id}/leave`, { successorId }, authConfig);
            setShowTransferModal(false);
            fetchGroupData(); 
        } catch (err) {
            alert(err.response?.data?.error || "Eroare la părăsirea grupului.");
        }
    };

    const getTagColor = (type) => {
        switch(type) {
            case 'RETETA': return '#ff6b6b'; 
            case 'SFAT_CULINAR': return '#4ecdc4'; 
            case 'INTREBARE': return '#feca57'; 
            default: return '#c8d6e5'; 
        }
    };

    const handleLike = async (postId) => {
        try {
            await axios.post(`${baseUrl}/api/posts/${postId}/like`, {}, authConfig);
            fetchPosts(); 
        } catch (err) { console.error("Eroare like", err); }
    };

    const handleSave = async (postId) => {
        try {
            await axios.post(`${baseUrl}/api/posts/${postId}/save`, {}, authConfig);
            fetchPosts(); 
        } catch (err) { console.error("Eroare salvare", err); }
    };

    const handleToggleComments = async (postId) => {
        const isExpanded = expandedComments[postId];
        setExpandedComments(prev => ({ ...prev, [postId]: !isExpanded }));

        if (!isExpanded) {
            try {
                const res = await axios.get(`${baseUrl}/api/posts/${postId}/comments`, authConfig);
                setPostComments(prev => ({ ...prev, [postId]: res.data }));
            } catch (err) { console.error("Eroare incarcare comentarii", err); }
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
        } catch (err) { console.error("Eroare adaugare comentariu", err); }
    };

    if (!group) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Se încarcă...</div>;

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
                    <input type="text" className="search-bar" placeholder="Caută rețete și utilizatori..." onClick={() => navigate('/search')} />
                    <nav className="nav-links">
                        <button className="btn-primary" onClick={() => navigate('/add-post')}>Postează</button>
                    </nav>
                </div>
            </header>

            <div className="app-container">
                <aside className="sidebar-left">
                    <div className="profile-card">
                        <h2> {group.name}</h2>
                        <p className="text-muted" style={{ marginBottom: '15px' }}>Creat de: {group.creator_name}</p>
                        <p>{group.description}</p>
                        
                        {!group.isMember && (
                            <button className="btn-secondary" style={{ marginTop: '20px', width: '100%' }} onClick={handleJoinGroup}>
                                Join Group
                            </button>
                        )}

                        {group.isMember && !showTransferModal && (
                            <button className="btn-small" style={{ marginTop: '20px', backgroundColor: '#eee', color: '#666', width: '100%' }} onClick={handleInitiateLeave}>
                                Leave Community
                            </button>
                        )}

                        {showTransferModal && (
                            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '10px', border: '1px solid #ffeeba' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>Transferă Drepturile</h4>
                                <select 
                                    value={selectedSuccessorId}
                                    onChange={(e) => setSelectedSuccessorId(e.target.value)}
                                    style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px' }}
                                >
                                    <option value="">-- Alege un expert --</option>
                                    {successors.map(s => <option key={s.id} value={s.id}>{s.username}</option>)}
                                </select>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button 
                                        className="btn-primary" 
                                        style={{ flex: 1, backgroundColor: '#d9534f', padding: '5px' }} 
                                        onClick={() => {
                                            if(!selectedSuccessorId) return alert("Selectează un expert!");
                                            executeLeaveRequest(selectedSuccessorId);
                                        }}>Leave</button>
                                    <button className="btn-secondary" style={{ flex: 1, padding: '5px' }} onClick={() => setShowTransferModal(false)}>Anulează</button>
                                </div>
                            </div>
                        )}

                        {group.isMember && (
                            <div style={{ marginTop: '20px', color: 'var(--secondary-color)', fontWeight: 'bold' }}>✓ Ești membru ({group.memberRole})</div>
                        )}
                    </div>
                </aside>

                <main className="feed">
                    {group.isMember && (
                        <div className="create-post" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                <input type="text" placeholder="Titlul postării..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={{ flex: 2 }} />
                                <select value={newType} onChange={(e) => setNewType(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc' }}>
                                    <option value="GENERAL">General</option>
                                    <option value="RETETA">Rețetă</option>
                                    <option value="SFAT_CULINAR">Sfat Culinar</option>
                                    <option value="INTREBARE">Întrebare</option>
                                </select>
                            </div>
                            
                            <input 
                                type="file" accept="image/*" onChange={handleImageChange} 
                                style={{ width: '100%', padding: '10px 0' }} 
                            />
                            
                            {newImagePreview && (
                                <div style={{ marginTop: '5px', width: '100%' }}>
                                    <img src={newImagePreview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '10px' }} />
                                </div>
                            )}

                            <textarea placeholder="Scrie detalii..." value={newContent} onChange={(e) => setNewContent(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', minHeight: '80px', fontFamily: 'inherit' }} />
                            <button className="btn-primary" onClick={handleCreatePost} style={{ alignSelf: 'flex-end' }}>Postează</button>
                        </div>
                    )}

                    {posts.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#666' }}>Nu există postări. Fii tu primul!</p>
                    ) : (
                        posts.map((post) => (
                            <article key={post.id} className="post">
                                <div className="post-header">
                                    <div className="post-avatar" style={{ backgroundImage: post.profile_pic ? 'url(' + post.profile_pic + ')' : 'none', backgroundSize: 'cover' }}></div>
                                    <div className="post-meta">
                                        <h3>{post.username}</h3>
                                        <span className="timestamp">{new Date(post.created_at).toLocaleString('ro-RO')}</span>
                                    </div>
                                    <div style={{ marginLeft: 'auto' }}>
                                        <span style={{ backgroundColor: getTagColor(post.post_type), color: '#fff', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                            {post.post_type?.replace('_', ' ') || 'GENERAL'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="post-content">
                                    <h2 className="recipe-title" style={{ marginTop: '0' }}>{post.title}</h2>
                                    <p className="recipe-desc">{post.content}</p>
                                    {post.image_url && (
                                        <div className="post-image" style={{ marginTop: '15px' }}>
                                            <img src={post.image_url} alt="Post" style={{ width: '100%', borderRadius: '10px', objectFit: 'cover', maxHeight: '400px' }} />
                                        </div>
                                    )}
                                </div>

                                <div className="post-actions" style={{ borderTop: '1px solid #eee', marginTop: '15px', paddingTop: '10px' }}>
                                    <button 
                                        className="action-btn" onClick={() => handleLike(post.id)}
                                        style={{ color: post.is_liked ? '#ff6b6b' : 'inherit', fontWeight: post.is_liked ? 'bold' : 'normal' }}
                                    >
                                        {post.is_liked ? 'Liked' : 'Like'} ({post.likes_count || 0})
                                    </button>
                                    <button className="action-btn" onClick={() => handleToggleComments(post.id)}> Comment</button>
                                    <button 
                                        className="action-btn" onClick={() => handleSave(post.id)}
                                        style={{ color: post.is_saved ? '#4ecdc4' : 'inherit', fontWeight: post.is_saved ? 'bold' : 'normal' }}
                                    >
                                        {post.is_saved ? 'Saved' : 'Save'}
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
                        ))
                    )}
                </main>
            </div>
        </div>
    );
}