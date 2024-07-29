import React, { useState } from 'react';
import './LoginPopup.css';

function LoginPopup({ setIsLoggedIn, setIsLoginPopupOpen }) {
  const [view, setView] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === 'password') {
      setIsLoggedIn(true);
      setIsLoginPopupOpen(false);
    } else {
      alert('Invalid username or password');
    }
  };

  const handleForgotPassword = () => {
    alert('Password reset link has been sent to your email.');
    setIsLoginPopupOpen(false);
  };

  const handleCreateAccount = () => {
    alert('Account created successfully.');
    setIsLoginPopupOpen(false);
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <button className="login-close-button" onClick={() => setIsLoginPopupOpen(false)}>×</button>
        {view === 'login' && (
          <>
            <h2>Login</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin} className='login-popup-button'>Login</button>
            <div className="popup-links">
              <span onClick={() => setView('forgot-password')}>Forgot Password?</span>
              <span onClick={() => setView('create-account')}>Create Account</span>
            </div>
          </>
        )}
        {view === 'forgot-password' && (
          <>
            <h2>Forgot Password</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleForgotPassword}>Submit</button>
            <div className="popup-links">
              <span onClick={() => setView('login')}>Login</span>
            </div>
          </>
        )}
        {view === 'create-account' && (
          <>
            <h2>Create Account</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleCreateAccount}>Create Account</button>
            <div className="popup-links">
              <span onClick={() => setView('login')}>Login</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginPopup;
