import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Main.css';

const Main = () => {
  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/quran">Quran</Link></li>
          <li><Link to="/hadith">Hadith</Link></li>
          <li><Link to="/adhkar">Adhkar</Link></li> {/* NEW */}
        </ul>
      </nav>

      {/* Ensure content doesn't go under the navbar */}
      <div className="main-content">
        
    
      </div>
    </div>
  );
};

export default Main;
