import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import JuzList from './pages/JuzList';
import Bookmark from './pages/Bookmark';
import AudiosHistory from './pages/AudiosHistory';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { BiMicrophone, BiMicrophoneOff } from 'react-icons/bi';
import './css/Home.css';

const surahNameMap = {
  "fatihah": 1, "baqarah": 2, "aaliimran": 3, "annisa": 4, "maidah": 5,
  "anam": 6, "araf": 7, "anfal": 8, "attawbah": 9, "yunus": 10,
  "hud": 11, "yusuf": 12, "arrad": 13, "ibrahim": 14, "hijr": 15,
  "annahl": 16, "isra": 17, "kahf": 18, "maryam": 19, "taha": 20,
  "anbiya": 21, "hajj": 22, "muminun": 23, "annur": 24, "furqan": 25,
  "ashshuara": 26, "annaml": 27, "qasas": 28, "ankabut": 29, "arrum": 30,
  "luqman": 31, "assajdah": 32, "ahzab": 33, "saba": 34, "fatir": 35,
  "yasin": 36, "assaffat": 37, "sad": 38, "azzumar": 39, "ghafir": 40,
  "fussilat": 41, "ashshura": 42, "azzukhruf": 43, "addukhan": 44, "jathiyah": 45,
  "ahqaf": 46, "muhammad": 47, "fath": 48, "hujurat": 49, "qaf": 50,
  "adhdhariyat": 51, "attur": 52, "annajm": 53, "qamar": 54, "arrahman": 55,
  "waqiah": 56, "hadid": 57, "mujadila": 58, "hashr": 59, "mumtahanah": 60,
  "assaff": 61, "jumuah": 62, "munafiqun": 63, "attaghabun": 64, "attalaq": 65,
  "attahrim": 66, "mulk": 67, "qalam": 68, "haqqah": 69, "maarij": 70,
  "nuh": 71, "jinn": 72, "muzzammil": 73, "muddaththir": 74, "qiyamah": 75,
  "insan": 76, "mursalat": 77, "annaba": 78, "annaziat": 79, "abasa": 80,
  "attakwir": 81, "infitar": 82, "mutaffifin": 83, "inshiqaq": 84, "buruj": 85,
  "attariq": 86, "ala": 87, "ghashiyah": 88, "fajr": 89, "balad": 90,
  "ashshams": 91, "layl": 92, "adduha": 93, "ashsharh": 94, "attin": 95,
  "alaq": 96, "qadr": 97, "bayyinah": 98, "azzalzalah": 99, "adiyat": 100,
  "qariah": 101, "attakathur": 102, "asr": 103, "humazah": 104, "fil": 105,
  "quraysh": 106, "maun": 107, "kawthar": 108, "kafirun": 109, "annasr": 110,
  "masad": 111, "ikhlas": 112, "falaq": 113, "annas": 114
};

const Home = () => {
  const [surahs, setSurahs] = useState([]);
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("surah");
  const [bookmarkedSurahs, setBookmarkedSurahs] = useState([]);
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await axios.get('https://api.alquran.cloud/v1/surah');
        setSurahs(response.data.data);
        setFilteredSurahs(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const savedBookmarks = JSON.parse(localStorage.getItem("bookmarkedSurahs")) || [];
    setBookmarkedSurahs(savedBookmarks);
    fetchSurahs();
  }, []);

  useEffect(() => {
    if (isVoiceSearching && transcript) {
      const normalized = transcript.toLowerCase().replace("surah", "").trim();
      for (const [name, num] of Object.entries(surahNameMap)) {
        if (normalized.includes(name)) {
          SpeechRecognition.stopListening();
          resetTranscript();
          setIsVoiceSearching(false);
          navigate(`/surah/${num}`);
          break;
        }
      }
    }
  }, [transcript]);

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = surahs.filter(surah =>
      surah.name.toLowerCase().includes(term) ||
      surah.englishName.toLowerCase().includes(term)
    );
    setFilteredSurahs(filtered);
  };

  const startVoiceSearch = () => {
    setIsVoiceSearching(true);
    resetTranscript();
    SpeechRecognition.startListening({ language: "en-US", continuous: false });
  };

  const stopVoiceSearch = () => {
    SpeechRecognition.stopListening();
    setIsVoiceSearching(false);
  };

  const toggleBookmark = (surah) => {
    let updatedBookmarks;
    if (bookmarkedSurahs.some((b) => b.number === surah.number)) {
      updatedBookmarks = bookmarkedSurahs.filter((b) => b.number !== surah.number);
    } else {
      updatedBookmarks = [...bookmarkedSurahs, surah];
    }
    setBookmarkedSurahs(updatedBookmarks);
    localStorage.setItem("bookmarkedSurahs", JSON.stringify(updatedBookmarks));
  };

  return (
    <div className="home-container">
      <h1 className="title">AL-QURAN</h1>
      <div className="tab-navigation">
        <button className={activeTab === "surah" ? "active" : ""} onClick={() => setActiveTab("surah")}>Surah</button>
        <button className={activeTab === "juz" ? "active" : ""} onClick={() => setActiveTab("juz")}>Juz</button>
        <button className={activeTab === "bookmark" ? "active" : ""} onClick={() => setActiveTab("bookmark")}>Bookmark</button>
        <button className={activeTab === "audios" ? "active" : ""} onClick={() => setActiveTab("audios")}>Audios History</button>
      </div>

      {activeTab === "surah" && (
        <>
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-bar"
                placeholder="Search Surah by name..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className="mic-inside-input" onClick={isVoiceSearching ? stopVoiceSearch : startVoiceSearch}>
                {isVoiceSearching ? <BiMicrophoneOff /> : <BiMicrophone />}
              </button>
            </div>
          </div>

          {loading ? (
            <p className="loading-text">Loading Surahs...</p>
          ) : (
            <div className="grid-container">
              {filteredSurahs.map(surah => (
                <div key={surah.number} className="surah-card">
                  <span 
                    className="heart-icon" 
                    onClick={() => toggleBookmark(surah)}
                    style={{ cursor: 'pointer', color: bookmarkedSurahs.some(b => b.number === surah.number) ? 'green' : 'black' }}
                  >
                    {bookmarkedSurahs.some(b => b.number === surah.number) ? '💚' : '♡'}
                  </span>
                  <Link to={`/surah/${surah.number}`} className="surah-link">
                    <div className="surah-number">{surah.number}</div>
                    <div className="surah-name-arabic">{surah.name}</div>
                    <div className="surah-name-english">{surah.englishName}</div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "juz" && <JuzList />} 
      {activeTab === "bookmark" && <Bookmark bookmarkedSurahs={bookmarkedSurahs} />} 
      {activeTab === "audios" && <AudiosHistory />}
    </div>
  );
};

export default Home;
