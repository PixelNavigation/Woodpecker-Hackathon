import React, { useState, useEffect } from 'react';
import './HomePage.css';
import imagePath from 'D:/Hackthon Project/frontend/src/assets/robo.png';

const HomePage = () => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleScroll = () => {
            const position = window.pageYOffset;
            setScrollPosition(position);
        };

        const updateMousePosition = (ev) => {
            setMousePosition({ x: ev.clientX, y: ev.clientY });
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', updateMousePosition);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', updateMousePosition);
        };
    }, []);

    const titleScale = Math.max(1 - scrollPosition / 500, 0.5);
    const titleOpacity = Math.max(1 - scrollPosition / 300, 0);
    const contentOpacity = Math.min(scrollPosition / 300, 1);
    const textSlide = Math.min(scrollPosition / 5, 100);
    const robotOpacity = Math.min((scrollPosition - 300) / 300, 1);
    const footerOpacity = Math.min((scrollPosition - 700) / 200, 1);

    return (
        <div className="home-page">
            <div className="glow" style={{ 
                left: `${mousePosition.x}px`, 
                top: `${mousePosition.y}px` 
            }}></div>
            <div className="title-container">
                <h1 className="main-title" style={{ 
                    transform: `translate(-50%, -50%) scale(${titleScale})`,
                    opacity: titleOpacity
                }}>
                    DATABIT
                </h1>
            </div>
            <div className="content-container" style={{ opacity: contentOpacity }}>
                <div className="text-container" style={{
                    transform: `translateX(${textSlide - 100}%)`
                }}>
                    <h2 className="interactive-text welcome-text">
                        WELCOME TO DATABIT
                    </h2>
                    <p className="interactive-text">
                        Supercharge your sales strategy with our <span className="underline">AI-powered</span> Sales Forecast Generator.
                        Get accurate projections and make data-driven decisions to maximize your business's potential.
                    </p>
                </div>
                <div className="image-container" style={{ opacity: robotOpacity }}>
                    <img src={imagePath} alt="AI illustration" className="side-image" />
                </div>
            </div>
            <footer className="footer" style={{ opacity: footerOpacity }}>
                <div className="footer-content">
                    <p className="team-name">Team Name: <strong>cse22733176</strong></p>
                    <p className="team-members">Team Members:</p>
                    <p className="team-member-list">
                        Gautam Babel Jain (Leader), 
                        Gourav Mital
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;