import React, { useEffect, useState } from "react";
import "../css/Hadith.css";

export default function HadithApp() {
  const [editions, setEditions] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [translations, setTranslations] = useState([]);
  const [selectedTranslation, setSelectedTranslation] = useState(null);
  const [hadiths, setHadiths] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredHadiths, setFilteredHadiths] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const hadithsPerPage = 10;


  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.json")
      .then((res) => res.json())
      .then((data) => {
        const allBooks = new Set();
        const allEditions = [];
        for (const lang in data) {
          const items = data[lang].collection.map((col) => ({ ...col, lang }));
          items.forEach((item) => allBooks.add(item.book));
          allEditions.push(...items);
        }
        setEditions(allEditions);
        setBooks(Array.from(allBooks));
      });
  }, []);

  const handleBookClick = (book) => {
    setSelectedBook(book);
    const related = editions.filter(
      (e) => e.book.toLowerCase().trim() === book.toLowerCase().trim()
    );
    setTranslations(related);
    setSelectedTranslation(related[0] || null);
    setHadiths([]);
    setFilteredHadiths([]);
    setSearchTerm("");
    if (related[0]) handleTranslationChange(related[0]);
  };

   const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTranslationChange = async (edition) => {
    setSelectedTranslation(edition);
    try {
      const res = await fetch(edition.linkmin || edition.link);
      const data = await res.json();

      if (Array.isArray(data.hadiths)) {
        const nonEmptyHadiths = data.hadiths.filter(
          (h) => h.text && h.text.trim().length > 0
        );

        if (nonEmptyHadiths.length === 0) {
          alert("This edition has no readable hadiths. Please choose another version.");
          setHadiths([]);
          setFilteredHadiths([]);
          return;
        }

        setHadiths(nonEmptyHadiths);
        setFilteredHadiths(nonEmptyHadiths);
        setCurrentPage(1);
      } else {
        setHadiths([]);
        setFilteredHadiths([]);
      }
    } catch (err) {
      console.error("Error fetching hadiths:", err);
      setHadiths([]);
      setFilteredHadiths([]);
    }
  };

  const handleBack = () => {
    setSelectedTranslation(null);
    setSelectedBook(null);
    setHadiths([]);
    setFilteredHadiths([]);
    setSearchTerm("");
    setCurrentPage(1);
  };

  useEffect(() => {
    const trimmedTerm = searchTerm.trim().toLowerCase();
    if (!trimmedTerm) {
      setFilteredHadiths(hadiths);
    } else {
      const filtered = hadiths.filter((h) => {
        const plainText =
          typeof h === "string"
            ? h
            : h.text || h.hadith?.text || h.hadith || JSON.stringify(h);
        return plainText.toLowerCase().includes(trimmedTerm);
      });
      setFilteredHadiths(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, hadiths]);

  const renderHadithText = (h) => {
    const text =
      typeof h === "string"
        ? h
        : h.text || h.hadith?.text || h.hadith || JSON.stringify(h);

    if (!text || !searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} style={{ backgroundColor: "#ffff00", fontWeight: "bold" }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const startVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedTranslation?.lang || "en";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setSearchTerm(voiceText);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };
  };

  const downloadSingleHadith = (h, i) => {
    const number = h.hadithnumber || i + 1;
    const lang = selectedTranslation?.lang?.toUpperCase() || "Hadith";
    const text = h.text || h.hadith?.text || h.hadith || "No text available.";

    const content = `Hadith Number: ${number}\nLanguage: ${lang}\n\n${text}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Hadith_${number}_${lang}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Pagination Calculations
  const indexOfLastHadith = currentPage * hadithsPerPage;
  const indexOfFirstHadith = indexOfLastHadith - hadithsPerPage;
  const currentHadiths = filteredHadiths.slice(indexOfFirstHadith, indexOfLastHadith);
  const totalPages = Math.ceil(filteredHadiths.length / hadithsPerPage);

  return (
    <div className="hadith-app">
      <div className="top-header">
        {selectedBook && selectedTranslation && (
          <button className="back-button-inline" onClick={handleBack}>
            ↞
          </button>
        )}
        <h1>Hadith</h1>
      </div>

      {!selectedBook && (
        <div className="edition-grid">
          {[
            { book: "abudawud", arabic: "أبو داود" },
            { book: "bukhari", arabic: "البخاري" },
            { book: "dehlawi", arabic: "الدهلوي" },
            { book: "ibnmajah", arabic: "ابن ماجه" },
            { book: "malik", arabic: "مالك" },
            { book: "muslim", arabic: "مسلم" },
            { book: "nasai", arabic: "النسائي" },
            { book: "nawawi", arabic: "النووي" },
            { book: "qudsi", arabic: "قدسي" },
            { book: "tirmidhi", arabic: "الترمذي" },
          ].map(({ book, arabic }, index) => (
            <div
              key={index}
              className="edition-card dual-lang"
              onClick={() => handleBookClick(book)}
            >
              <span className="arabic-text">{arabic}</span>
              <span className="english-text">{book}</span>
            </div>
          ))}
        </div>
      )}

      {selectedBook && selectedTranslation && (
        <div className="hadith-header">
          <div className="hadith-controls">
            <select
              className="language-dropdown"
              value={selectedTranslation.language}
              onChange={(e) => {
                const newEdition = translations.find(
                  (ed) => ed.language === e.target.value
                );
                if (newEdition) handleTranslationChange(newEdition);
              }}
            >
              {translations.map((edition, index) => (
                <option key={index} value={edition.language}>
                  {edition.lang.toUpperCase()} - {edition.name}
                </option>
              ))}
            </select>

            <div className="search-input-container">
              <input
                type="text"
                className="search-input"
                placeholder={`Search in ${selectedTranslation?.lang?.toUpperCase() || "Hadith"}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="search-button"
                onClick={startVoiceSearch}
                title="Voice Search"
                style={{ padding: "6px" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="black"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2ZM11 18h2v3h-2v-3Z" />
                </svg>
              </button>
            </div>
          </div>

          {currentHadiths.map((h, i) => (
            <div key={i} className="hadith-box">
              <h4>
                Hadith {h.hadithnumber || indexOfFirstHadith + i + 1}
                <button
                  onClick={() => downloadSingleHadith(h, i)}
                  title="Download Hadith"
                  style={{
                    marginLeft: "10px",
                    fontSize: "14px",
                    backgroundColor: "#a6b9d4",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" height="24" width="24">
                    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" strokeWidth="2" />
                    <path d="m7 11 5 5 5 -5" strokeWidth="2" />
                    <path d="m12 4 0 12" strokeWidth="2" />
                  </svg>
                </button>
              </h4>
              <p>{renderHadithText(h)}</p>
            </div>
          ))}

          {filteredHadiths.length === 0 && (
            <div className="no-results">No hadiths found for "{searchTerm}"</div>
          )}

          {filteredHadiths.length > 0 && (
            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ↢ Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next ↣
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scroll to Top Button */}
      <button className="scroll-to-top" onClick={scrollToTop}>
        ⇑
      </button>
    </div>
  );
}
