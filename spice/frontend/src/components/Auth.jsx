import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import '../App.css'; 

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', confirmPassword: '', age: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // IP Dinamic - funcționează perfect de pe orice device/rețea!
    const baseUrl = `http://${window.location.hostname}:5000`;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (isLogin) {
            try {
                const res = await axios.post(`${baseUrl}/api/auth/login`, {
                    email: formData.email,
                    password: formData.password
                });
                localStorage.setItem('spice_token', res.data.token);
                localStorage.setItem('userRole', res.data.user.role);
                localStorage.setItem('userId', res.data.user.id);
                
                if (res.data.user.role === 'ADMINISTRATOR') {
                    navigate('/admin');
                } else {
                    navigate('/'); 
                }
            } catch (err) {
                setError(err.response?.data?.error || 'Eroare la autentificare.');
            }
        } else {
            if (formData.password !== formData.confirmPassword) {
                setError('Parolele nu coincid!');
                return;
            }
            try {
                const res = await axios.post(`${baseUrl}/api/auth/register`, {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    age: formData.age
                });
                setMessage(res.data.message || 'Cont creat cu succes! Te poți autentifica.');
                setIsLogin(true);
            } catch (err) {
                setError(err.response?.data?.error || 'Eroare la înregistrare.');
            }
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container">
                <div className="auth-card">
                    <img src={logo} alt="Spice Logo" className="auth-logo-img" style={{height: '60px', marginBottom: '20px'}} />
                    <h2>{isLogin ? 'Welcome Back' : 'Alătură-te SPICE'}</h2>
                    <p className="auth-subtitle">
                        {isLogin ? 'Loghează-te pentru a-ți împărtăși rețetele.' : 'Creează un cont pentru a descoperi comunitatea noastră.'}
                    </p>

                    {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
                    {message && <div style={{ color: 'green', marginBottom: '15px' }}>{message}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <>
                                <div className="form-group">
                                    <label>Nume de utilizator</label>
                                    <input type="text" name="username" className="form-control" placeholder="Numele tău" onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Vârstă</label>
                                    <input type="number" name="age" className="form-control" placeholder="Vârsta ta" onChange={handleChange} required />
                                </div>
                            </>
                        )}
                        
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" className="form-control" placeholder="Introdu email-ul" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Parolă</label>
                            <input type="password" name="password" className="form-control" placeholder="Introdu parola" onChange={handleChange} required />
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label>Confirmă Parola</label>
                                <input type="password" name="confirmPassword" className="form-control" placeholder="Confirmă parola" onChange={handleChange} required />
                            </div>
                        )}

                        <button type="submit" className="btn-primary auth-btn">
                            {isLogin ? 'Log In' : 'Creare Cont'}
                        </button>
                    </form>

                    <div className="auth-links">
                        <p>
                            {isLogin ? 'Nu ai cont? ' : 'Ai deja un cont? '}
                            <span style={{ cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
                                {isLogin ? 'Înregistrează-te aici' : 'Autentifică-te aici'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}