import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from './pages/Main';
import HomePage from './pages/HomePage'; // New HomePage component
import Home from './Home';
import SurahDetails from './pages/SurahDetails';
import JuzList from './pages/JuzList';
import JuzDetail from './pages/JuzDetail';
import PrayerTimes from './pages/PrayerTimes';
import HadithOfTheDay from "./pages/HadithOfTheDay";
import Hadith from './pages/Hadith';
import Adhkar from './pages/adhkar';

const App = () => {
  return (
    <Router>
      <Main /> {/* Navbar always visible */}
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Home page with AyatOfTheDay + PrayerTimes */}
        <Route path="/quran" element={<Home />} />
        <Route path="/surah/:number" element={<SurahDetails />} />
        <Route path="/juz" element={<JuzList />} />
        <Route path="/juz/:juzNumber" element={<JuzDetail />} />
        <Route path="/hadith" element={<Hadith />} />
        <Route path="/adhkar" element={<Adhkar />} /> {/* NEW */}
      </Routes>
    </Router>
  );
};

export default App;
