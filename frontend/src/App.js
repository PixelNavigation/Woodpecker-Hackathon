import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './components/HomePage';
import Working from './components/WorkingPage';
import Arima from './components/ARIMA';
import RandomForest from './components/RandomForest';
import Saves from './components/Saves';
import LoginPopup from './components/LoginPopup';
import HelpPopup from './components/HelpPopup';
import './App.css'; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isHelpPopupOpen, setIsHelpPopupOpen] = useState(false);

  return (
    <Router>
      <div className="App">
        <NavBar 
          isLoggedIn={isLoggedIn} 
          setIsLoginPopupOpen={setIsLoginPopupOpen}
          setIsLoggedIn={setIsLoggedIn}
        />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/working" element={<Working />} /> 
            {isLoggedIn && (
              <>
                <Route path="/arima" element={<Arima />} />
                <Route path="/random-forest" element={<RandomForest />} />
                <Route path="/saves" element={<Saves />} />
              </>
            )}
          </Routes>
        </div>
        {isLoginPopupOpen && (
          <LoginPopup 
            setIsLoginPopupOpen={setIsLoginPopupOpen}
            setIsLoggedIn={setIsLoggedIn}
          />
        )}
        {isHelpPopupOpen && (
          <HelpPopup setIsHelpPopupOpen={setIsHelpPopupOpen} />
        )}
        <button className="help-button" onClick={() => setIsHelpPopupOpen(true)}>Help</button>
      </div>
    </Router>
  );
}
export default App;