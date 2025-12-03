import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "../css/AyatOfTheDay.css";

const AyahOfTheDay = () => {
  const [ayah, setAyah] = useState("");
  const [translation, setTranslation] = useState("");
  const [surahInfo, setSurahInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force re-render

  // Function to fetch Ayah & Translation
  const fetchAyah = async () => {
    try {
      setLoading(true);

      // Fetch random Ayah (Arabic)
      const responseArabic = await fetch(`https://api.alquran.cloud/v1/ayah/random?timestamp=${Date.now()}`);
      const dataArabic = await responseArabic.json();
      if (!dataArabic.data) throw new Error("Failed to fetch Arabic Ayah");

      const ayahNumber = dataArabic.data.number;
      setAyah(dataArabic.data.text);
      setSurahInfo(`Surah ${dataArabic.data.surah.englishName}, Ayah ${dataArabic.data.numberInSurah}`);

      // Fetch translation for the same Ayah
      const responseTranslation = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/en.sahih?timestamp=${Date.now()}`);
      const dataTranslation = await responseTranslation.json();
      if (!dataTranslation.data) throw new Error("Failed to fetch translation");

      setTranslation(dataTranslation.data.text);
      setLoading(false);
      setRefreshKey((prevKey) => prevKey + 1); // Update key to force re-render

    } catch (error) {
      console.error("Error fetching Ayah:", error);
      setAyah("Could not load Ayah of the Day.");
      setTranslation("");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAyah(); // Fetch Ayah when the component loads
  }, []);

  return (
    <motion.div 
      className="ayah-container"
      key={refreshKey} // Forces React to re-render component
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h3 className="ayah-title">🌙 Ayah of the Day</h3>
      
      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <>
          {/* Arabic Ayah */}
          <motion.p 
            className="ayah-text arabic"
            key={`ayah-${refreshKey}`} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            "{ayah}"
          </motion.p>

          {/* English Translation */}
          <motion.p 
            className="ayah-translation"
            key={`trans-${refreshKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            "{translation}"
          </motion.p>

          <p className="surah-info">{surahInfo}</p>
        </>
      )}

      <button className="refresh-btn" onClick={fetchAyah}>
        🔄 Refresh Ayah
      </button>
    </motion.div>
  );
};

export default AyahOfTheDay;
