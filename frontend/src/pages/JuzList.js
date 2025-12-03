import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/JuzList.css';

const juzNames = [
  "الم", "سيقول", "تلك الرسل", "لن تنالوا", "والمحصنات",
  "لا يحب الله", "وإذا سمعوا", "ولو ترى", "قال الملأ",
  "واعلموا", "يعتذرون", "وما من دابة", "وما أبريء",
  "ربما", "سبحان الذي", "قال ألم", "اقترب للناس",
  "قد أفلح", "وقال الذين", "أمن خلق", "اتل ما أوحي",
  "ومن يقنت", "وما أنزلنا", "فمن أظلم", "إليه يرد",
  "حم", "قال فما خطبكم", "قد أسمع", "تبارك الذي",
  "عم"
];

const JuzList = () => {
  const [juzList, setJuzList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJuzData = async () => {
      try {
        // Fetch all 30 Juz data in parallel
        const responses = await Promise.all(
          Array.from({ length: 30 }, (_, i) =>
            axios.get(`https://api.alquran.cloud/v1/juz/${i + 1}`)
          )
        );

        // Extract valid Juz data from API responses
        const juzData = responses.map((res) => res.data.data);
        setJuzList(juzData);
      } catch (error) {
        console.error("Error fetching Juz data:", error);
      }
    };

    fetchJuzData();
  }, []);

  // Filter Juz based on search input
  const filteredJuzList = juzList.filter((juz) =>
    searchTerm === "" || juz.number.toString().includes(searchTerm)
  );

  return (
    <div className="juz-list-container">
      <div className="search-container">
        <input
          type="number"
          placeholder="Search by Juz number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      </div>

      {filteredJuzList.length > 0 ? (
        <div className="grid-container">
          {filteredJuzList.map((juz) => (
            <div
              key={juz.number}
              className="juz-card"
              onClick={() => navigate(`/juz/${juz.number}`)}
            >
              <h2 className="juz-number">{juz.number}</h2>
              <p className="juz-name-arabic">{juzNames[juz.number - 1]}</p>
              <p className="juz-name-english">
                Start Ayah: {juz.ayahs[0]?.surah.englishName} - Ayah {juz.ayahs[0]?.numberInSurah}
              </p>
              <p>Total Ayahs: {juz.ayahs?.length}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="loading-text">Loading Juz information or no results found...</p>
      )}
    </div>
  );
};

export default JuzList;
