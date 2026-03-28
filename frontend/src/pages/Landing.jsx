import React, { useState, useEffect } from "react";
import "../App.css";
import family from "../assets/family.png";
import videos from "../assets/video.jpg";
import Background from "./Background";

export default function Landing() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const phrases = [
    "Connect with your loved ones",
    "Share precious moments",
    "Real-time collaboration",
    "Crystal clear video calls",
    "Meaningful conversations",
    "Global connections"
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

 
  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    
    const handleTyping = () => {
      if (isDeleting) {
        // Deleting text
        setTypingText(currentPhrase.substring(0, typingText.length - 1));
        setTypingSpeed(50);
        
        if (typingText.length === 0) {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
          setTypingSpeed(150);
        }
      } else {
        // Typing text
        setTypingText(currentPhrase.substring(0, typingText.length + 1));
        setTypingSpeed(100);
        
        if (typingText.length === currentPhrase.length) {
          // Wait before starting to delete
          setTimeout(() => {
            setIsDeleting(true);
          }, 2000);
          setTypingSpeed(100);
        }
      }
    };
    
    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [typingText, isDeleting, currentPhraseIndex, phrases, typingSpeed]);

  const handleLogin = () => {
    console.log("Login clicked");
  };

  const handleRegister = () => {
    console.log("Register clicked");
  };

  const handleGuest = () => {
    console.log("Join as Guest clicked");
  };

  return (
    <div className="landingPageContainer">
      <Background />
      
     
      <div className="contentOverlay" />
      
      
      <div className="animatedOverlay" />
      
      {/* Custom cursor */}
      <div 
        className="customCursor" 
        style={{ 
          transform: `translate(${mousePosition.x - 15}px, ${mousePosition.y - 15}px)`,
          width: isHovering ? '40px' : '30px',
          height: isHovering ? '40px' : '30px',
          transition: 'all 0.2s ease'
        }}
      />

     
      <nav>
        <h1 className="logo">
          CollabSphere
          <span className="logoDot">.</span>
        </h1>

        <div className="navlist">
          <div className="guestLinks">
            <h2 className="guestLink" onClick={handleGuest}>Join as Guest</h2>
            <h2 className="guestLink" onClick={handleRegister}>Register</h2>
          </div>
          <button 
            className="loginBtn" 
            onClick={handleLogin}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            Login
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="MainContainer">
        <div className="leftSection">
          <div className="badge">
             Welcome to the future of connection
          </div>
          
          <h1>
            <span className="gradientText">Connect</span>
            <br />
            <div className="typingContainer">
              <span className="typingText">{typingText}</span>
              <span className="cursor typingCursor">|</span>
            </div>
          </h1>
          
          <p>
            Experience next-generation video calls with stunning visuals, 
            crystal-clear audio, and real-time collaboration tools. 
            Join thousands of happy users connecting globally with unparalleled quality.
          </p>
          
         
          
         
        </div>

        <div className="imageContainer">
          <div className="glassCard mainCard">
            <img src={family} alt="Family connecting" />
            <div className="cardOverlay">
              <p>Share Precious Moments</p>
            </div>
          </div>

          <div className="glassCard smallCard">
            <img src={videos} alt="Video call" />
            <div className="cardOverlay">
              <p>HD Video Quality</p>
            </div>
          </div>
          
          
        </div>
      </div>
    </div>
  );
}