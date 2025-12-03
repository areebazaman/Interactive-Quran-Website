import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css';

const Bookmark = ({ bookmarkedSurahs }) => {
  return (
    <div className="bookmark-container">
      <h2>Bookmarked Surahs</h2>
      {bookmarkedSurahs.length === 0 ? (
        <p>No Surahs bookmarked yet.</p>
      ) : (
        <div className="grid-container">
          {bookmarkedSurahs.map(surah => (
            <div key={surah.number} className="surah-card">
              <Link to={`/surah/${surah.number}`} className="surah-link">
                <div className="surah-number">{surah.number}</div>
                <div className="surah-name-arabic">{surah.name}</div>
                <div className="surah-name-english">{surah.englishName}</div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmark;
