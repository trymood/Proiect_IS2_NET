import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; 
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

export default function ViewPost() {
    const { id } = useParams(); // Luăm ID-ul postării din URL
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    
    // State-uri comentarii
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');

    const token = localStorage.getItem('spice_token');
    const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    const fetchPostDetails = useCallback(async () => {
        try {
            const res = await axios.get(`http://192.168.1.4:5000/api/posts/single/${id}`, authConfig);
            setPost(res.data);
        } catch (err) {
            console.error("Error loading recipe:", err);
            alert("Could not load the recipe.");
            navigate('/');
        }
    }, [id, navigate]);

    const fetchComments = useCallback(async () => {
        try {
            const res = await axios.get(`http://192.168.1.4:5000/api/posts/${id}/comments`, authConfig);
            setComments(res.data);
        } catch (err) {
            console.error("Error loading comments:", err);
        }
    }, [id]);

    useEffect(() => {
        if (!token) {
            navigate('/auth');
            return;
        }
        fetchPostDetails();
        fetchComments();
    }, [id, token, navigate, fetchPostDetails, fetchComments]);

    const handleLike = async () => {
        try {
            await axios.post(`http://192.168.1.4:5000/api/posts/${post.id}/like`, {}, authConfig);
            fetchPostDetails(); 
        } catch (err) { console.error(err); }
    };

    const handleSave = async () => {
        try {
            await axios.post(`http://192.168.1.4:5000/api/posts/${post.id}/save`, {}, authConfig);
            fetchPostDetails(); 
        } catch (err) { console.error(err); }
    };

    const handleAddComment = async (e) => {
        if (e.type === 'keydown' && e.key !== 'Enter') return;
        if (!commentInput.trim()) return;

        try {
            await axios.post(`http://192.168.1.4:5000/api/posts/${post.id}/comments`, { content: commentInput }, authConfig);
            setCommentInput('');
            fetchComments(); // Reîncărcăm lista de comentarii
        } catch (err) { console.error(err); }
    };

    if (!post) return <div style={{ padding: '50px', textAlign: 'center' }}>Se încarcă rețeta...</div>;

    return (
        <div>
            <header className="navbar">
    <div className="nav-container">
        <h1 className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>SPICE</h1>
        {/* 👈 MODIFICARE: Schimbat din window.close() în navigate(-1) pentru a merge înapoi la pagina anterioară */}
        <button className="btn-primary" onClick={() => navigate(-1)}>Back</button>
    </div>
</header>

            <div className="app-container" style={{ display: 'block', maxWidth: '700px', margin: '2rem auto' }}>
                <article className="post" style={{ padding: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {/* Header autor rețetă */}
                    <div className="post-header" style={{ marginBottom: '20px' }}>
                        <div className="post-avatar" style={{ 
                            backgroundImage: post.profile_pic ? `url(${post.profile_pic})` : 'none',
                            backgroundSize: 'cover', backgroundColor: '#ccc'
                        }}></div>
                        <div className="post-meta">
                            <h3 style={{ cursor: 'pointer' }} onClick={() => navigate(`/user/${post.user_id}`)}>{post.username}</h3>
                            <span className="timestamp">{new Date(post.created_at).toLocaleString('ro-RO')}</span>
                        </div>
                    </div>

                    {/* Conținut rețetă */}
                    <div className="post-content">
                        <h2 className="recipe-title" style={{ fontSize: '28px', marginBottom: '15px' }}>{post.title}</h2>
                        <p className="recipe-desc" style={{ fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{post.content}</p>
                        {post.image_url && (
                            <div className="post-image" style={{ marginTop: '20px' }}>
                                <img src={post.image_url} alt={post.title} style={{ width: '100%', borderRadius: '10px', maxHeight: '500px', objectFit: 'cover' }} />
                            </div>
                        )}
                    </div>

                    {/* Acțiuni */}
                    <div className="post-actions" style={{ borderTop: '1px solid #eee', marginTop: '20px', paddingTop: '15px' }}>
                        <button className="action-btn" onClick={handleLike} style={{ color: post.is_liked ? '#ff6b6b' : 'inherit', fontWeight: post.is_liked ? 'bold' : 'normal' }}>
                            {post.is_liked ? ' Liked' : ' Like'} ({post.likes_count || 0})
                        </button>
                        <button className="action-btn" style={{ fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                             Comments ({comments.length})
                        </button>
                        <button className="action-btn" onClick={handleSave} style={{ color: post.is_saved ? '#4ecdc4' : 'inherit', fontWeight: post.is_saved ? 'bold' : 'normal' }}>
                            {post.is_saved ? ' Saved' : ' Save Recipe'}
                        </button>
                    </div>

                    {/* Secțiune comentarii permanent deschisă pe această pagină */}
                    <div className="comments-section" style={{ padding: '15px 0 0 0', borderTop: '1px solid #eee', marginTop: '15px' }}>
                        <div className="comments-list" style={{ marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
                            {comments.map(comment => (
                                <div key={comment.id} style={{ display: 'flex', gap: '10px', marginBottom: '12px', textAlign: 'left' }}>
                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#ccc', backgroundImage: comment.profile_pic ? `url(${comment.profile_pic})` : 'none', backgroundSize: 'cover', flexShrink: 0 }}></div>
                                    <div style={{ backgroundColor: '#f8f9fa', padding: '10px 14px', borderRadius: '15px', flex: 1 }}>
                                        <strong style={{ fontSize: '13px' }}>{comment.username}</strong>
                                        <p style={{ margin: '3px 0 0 0', fontSize: '14px', color: '#333' }}>{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && (
                                <p style={{ fontSize: '13px', color: '#888', textAlign: 'center' }}>No comments yet. Be the first to comment!</p>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" placeholder="Write a comment..." value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                onKeyDown={handleAddComment}
                                style={{ flex: 1, padding: '10px 15px', borderRadius: '20px', border: '1px solid #ccc', outline: 'none' }}
                            />
                            <button className="btn-primary" style={{ padding: '0 20px', borderRadius: '20px' }} onClick={handleAddComment}>Send</button>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
}