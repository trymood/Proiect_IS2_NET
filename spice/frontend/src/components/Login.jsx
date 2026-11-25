import React, { useState } from 'react';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://192.168.1.4:5000/api/auth/login', { email, password });
            // Salvăm token-ul local [cite: 139]
            localStorage.setItem('spice_token', response.data.token);
            alert('Login successful!'); // Feedback vizual pentru utilizator
            // window.location.href = '/dashboard';
        } catch (err) {
            setError(err.response?.data?.error || 'Error during login');
            // Gestionează eroarea Soft Block [cite: 198]
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Autentificare SPICE</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} required /><br/>
                <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required /><br/>
                <button type="submit">Log In</button>
            </form>
        </div>
    );
}