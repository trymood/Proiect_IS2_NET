import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../App.css';

export default function Chat() {
    const { id: urlReceiverId } = useParams(); // ID-ul din URL (dacă există)
    const navigate = useNavigate();
    
    const [currentUser, setCurrentUser] = useState(null);
    const [conversations, setConversations] = useState([]); 
    const [activeChat, setActiveChat] = useState(null); 
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    const token = localStorage.getItem('spice_token');
    const authConfig = useMemo(() => {
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    }, [token]);
    
    const baseUrl = `http://${window.location.hostname}:5000`;

    // 1. Date inițiale
    useEffect(() => {
        if (!token) {
            navigate('/auth');
            return;
        }
        const initData = async () => {
            try {
                const meRes = await axios.get(`${baseUrl}/api/users/me`, authConfig);
                setCurrentUser(meRes.data);

                const convRes = await axios.get(`${baseUrl}/api/messages/conversations/list`, authConfig);
                setConversations(convRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        initData();
    }, [authConfig, navigate, baseUrl, token]);

    // 2. Schimbarea ferestrei de chat la selectarea unui utilizator
    useEffect(() => {
        if (!urlReceiverId) {
            setActiveChat(null);
            setMessages([]);
            return;
        }
        const loadChat = async () => {
            try {
                const receiverRes = await axios.get(`${baseUrl}/api/users/${urlReceiverId}`, authConfig);
                setActiveChat(receiverRes.data);

                const msgRes = await axios.get(`${baseUrl}/api/messages/${urlReceiverId}`, authConfig);
                setMessages(msgRes.data);
                
                setConversations(prev => {
                    if (!prev.find(u => u.id === receiverRes.data.id)) {
                        return [receiverRes.data, ...prev];
                    }
                    return prev;
                });
            } catch (err) {
                console.error(err);
            }
        };
        loadChat();
    }, [urlReceiverId, authConfig, baseUrl]);

    // 3. WebSockets (Conexiune unică)
    useEffect(() => {
        if (!currentUser) return;
        socketRef.current = io(baseUrl);
        socketRef.current.emit('register', currentUser.id);

        socketRef.current.on('receive_message', (message) => {
            setMessages((prev) => {
                if (prev.find(m => m.id === message.id)) return prev;
                return [...prev, message];
            });
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [currentUser, baseUrl]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim() === "" || !activeChat) return;
        const messageData = {
            sender_id: currentUser.id,
            receiver_id: activeChat.id,
            content: newMessage
        };
        socketRef.current.emit('send_message', messageData);
        setNewMessage("");
    };

    return (
        <div className="chat-page-container">
            
            {/* 📁 BARA LATERALĂ (Ascunsă pe mobil dacă avem un chat deschis) */}
            <div className={`chat-sidebar ${urlReceiverId ? 'chat-active-mobile' : ''}`}>
                <div style={{ padding: '20px', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button className="btn-small" onClick={() => navigate('/')} style={{ padding: '5px 10px', backgroundColor: 'white', color: 'var(--primary-color)' }}>⬅ Home</button>
                    <h3 style={{ margin: 0 }}>Conversații</h3>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {conversations.length === 0 ? (
                        <p style={{ padding: '20px', color: '#888', textAlign: 'center' }}>Nicio conversație încă.</p>
                    ) : (
                        conversations.map(user => (
                            <div 
                                key={user.id} 
                                onClick={() => navigate(`/chat/${user.id}`)}
                                style={{ 
                                    display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', 
                                    borderBottom: '1px solid #eee', cursor: 'pointer',
                                    backgroundColor: activeChat?.id === user.id ? '#f5f5f5' : '#fff'
                                }}
                            >
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ccc', backgroundImage: user.profile_pic ? `url(${user.profile_pic})` : 'none', backgroundSize: 'cover' }}></div>
                                <span style={{ fontWeight: 'bold' }}>{user.username}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/*  REGIUNEA DE CHAT (Ascunsă pe mobil dacă lista e goală) */}
            <div className={`chat-main-area ${!urlReceiverId ? 'chat-empty-mobile' : ''}`}>
                {!activeChat ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', padding: '20px', textAlign: 'center' }}>
                        <h2>Selectează o conversație din stânga pentru a începe!</h2>
                    </div>
                ) : (
                    <>
                        {/* Header Conversație */}
                        <div style={{ padding: '15px 20px', backgroundColor: '#fff', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {/* Butonul magic care te trimite înapoi la listă pe telefon */}
                            <button className="chat-mobile-back-btn" onClick={() => navigate('/chat')}>⬅</button>
                            
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ccc', backgroundImage: activeChat.profile_pic ? `url(${activeChat.profile_pic})` : 'none', backgroundSize: 'cover', cursor: 'pointer' }} onClick={() => navigate(`/user/${activeChat.id}`)}></div>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary-color)' }}>{activeChat.username}</h2>
                        </div>

                        {/* Mesaje */}
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {messages.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#888', margin: 'auto' }}>Fă tu primul pas și salută-l pe {activeChat.username}!</p>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.sender_id === currentUser?.id;
                                    return (
                                        <div key={index} className="chat-message-bubble" style={{ 
                                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                                            backgroundColor: isMe ? '#ff6b6b' : '#ffffff',
                                            color: isMe ? '#ffffff' : '#333333',
                                            padding: '10px 15px', borderRadius: '20px', maxWidth: '70%',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                            borderBottomRightRadius: isMe ? '5px' : '20px',
                                            borderBottomLeftRadius: !isMe ? '5px' : '20px'
                                        }}>
                                            <p style={{ margin: 0, wordBreak: 'break-word' }}>{msg.content}</p>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input mesaje */}
                        <div style={{ padding: '15px 20px', backgroundColor: '#fff', borderTop: '1px solid #ddd', display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" placeholder="Scrie un mesaj..." value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                                style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid #ccc', outline: 'none' }}
                            />
                            <button className="btn-primary" style={{ padding: '10px 25px' }} onClick={handleSendMessage}>Trimite</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}