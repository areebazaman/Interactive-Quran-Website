import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/JuzDetail.css';

const JuzDetail = () => {
  const { juzNumber } = useParams();
  const navigate = useNavigate();
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranslation, setSelectedTranslation] = useState('en.sahih');
  const [translation, setTranslation] = useState([]);
  const [showTranslation, setShowTranslation] = useState(false);
  const [searchJuz, setSearchJuz] = useState('');

  // Fetch Quran verses for the current Juz
  useEffect(() => {
    const fetchJuzDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://api.alquran.cloud/v1/juz/${juzNumber}/quran-uthmani`);
        setVerses(response.data.data.ayahs);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Juz verses:", error);
        setLoading(false);
      }
    };

    fetchJuzDetail();
  }, [juzNumber]);

  // Fetch translation
  useEffect(() => {
    const fetchTranslation = async () => {
      if (juzNumber && selectedTranslation) {
        try {
          const response = await fetch(`http://api.alquran.cloud/v1/juz/${juzNumber}/${selectedTranslation}`);
          const data = await response.json();
          if (data && data.data) {
            setTranslation(data.data.ayahs);
          } else {
            setTranslation([]);
          }
        } catch (error) {
          console.error("Error fetching translation:", error);
        }
      }
    };

    fetchTranslation();
  }, [juzNumber, selectedTranslation]);

  const handleTranslationChange = (e) => {
    setSelectedTranslation(e.target.value);
    setShowTranslation(false);
  };

  const handleTranslationToggle = () => {
    setShowTranslation(!showTranslation);
  };

  // ✅ Automatically navigate to new Juz when valid number entered
  const handleJuzSearchChange = (e) => {
    const val = e.target.value;
    setSearchJuz(val);

    const juzNum = parseInt(val);
    if (!isNaN(juzNum) && juzNum >= 1 && juzNum <= 30) {
      navigate(`/juz/${juzNum}`);
    }
  };

  return (
    <div className="verses-container">
      <h1 className="juz-title">Juz {juzNumber}</h1>

      {/* Search bar & translation selector */}
      <div className="search-language-container">
        <div className="search-bar-container">
          <input
            type="number"
            className="search-bar"
            placeholder="Enter Juz Number..."
            value={searchJuz}
            onChange={handleJuzSearchChange}
          />
        </div>

        <div className="translation-dropdown">
          <select value={selectedTranslation} onChange={handleTranslationChange}>
            <option value="en.sahih">Sahih International (English)</option>
            <option value="ur.junagarhi">Junagarhi (Urdu)</option>
            <option value="fr.hamidullah">Hamidullah (French)</option>
          </select>

          <button onClick={handleTranslationToggle} className="short-button">
            {showTranslation ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading verses...</p>
      ) : (
        <div className="verses-list">
          {verses.length > 0 ? (
            verses.map((verse, index) => (
              <div key={verse.number} className="verse-block">
                {verse.numberInSurah === 1 && (
                  <h2 className="surah-name">
                    {verse.surah.englishName} ({verse.surah.name})
                  </h2>
                )}

                <div className="verse-line">
                  <span className="verse-number">{index + 1}</span>
                  <span className="verse-text">{verse.text} ۞ </span>
                </div>

                {showTranslation && translation[index] && (
                  <div className="verse-translation">
                    {translation[index].text || 'Translation not available'}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No verses found for this Juz.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default JuzDetail;
