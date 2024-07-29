import React, { useState } from 'react';
import './HelpPopup.css';

const HelpPopup = ({ setIsHelpPopupOpen }) => {
  const [email, setEmail] = useState('');
  const [query, setQuery] = useState('');

  const handleSend = () => {
    console.log('Email:', email);
    console.log('Query:', query);
    setIsHelpPopupOpen(false);
  };

  return (
    <div className="help-popup">
      <div className="help-popup-content">
        <button className="close-button" onClick={() => setIsHelpPopupOpen(false)}>×</button>
        <h3>Help</h3>
        <input 
          type="email" 
          placeholder="Your Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
        />
        <textarea 
          placeholder="Your Query" 
          value={query}
          onChange={(e) => setQuery(e.target.value)} 
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default HelpPopup;
