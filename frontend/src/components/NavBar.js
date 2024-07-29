import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';
import logo from '../assets/logo.svg'; 
import { FaUserCircle } from 'react-icons/fa';

function NavBar({ isLoggedIn, setIsLoginPopupOpen, setIsLoggedIn }) {
  const [isAccountPopupOpen, setIsAccountPopupOpen] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAccountPopupOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="left-items">
        <div className="logo">
          <img src={logo} alt="Company Logo" />
          DATABIT
        </div>
        <div className="tabs">
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>HOME</NavLink>
          <NavLink to="/working" className={({ isActive }) => isActive ? 'active' : ''}>WORKING</NavLink>
          {isLoggedIn && (
            <>
              <NavLink to="/arima" className={({ isActive }) => isActive ? 'active' : ''}>UNIVARIATE</NavLink>
              <NavLink to="/random-forest" className={({ isActive }) => isActive ? 'active' : ''}>MULTIVARIATE</NavLink>
              <NavLink to="/saves" className={({ isActive }) => isActive? 'active' : ''}>SAVES</NavLink>
            </>
          )}
        </div>
      </div>
      <div className="right-items">
        {!isLoggedIn ? (
          <button className="login-button" onClick={() => setIsLoginPopupOpen(true)}>LOGIN</button>
        ) : (
          <div className="account-icon" onClick={() => setIsAccountPopupOpen(!isAccountPopupOpen)}>
            <FaUserCircle size={30} color="#fff" />
            {isAccountPopupOpen && (
              <div className="account-popup">
                <button onClick={handleLogout}>LOGOUT</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
