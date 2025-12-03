import React, { useEffect, useState } from "react";
import "../css/adhkar.css";

function AdhkarApp() {
  const [adhkarData, setAdhkarData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAdhkar() {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/nawafalqari/azkar-api/56df51279ab6eb86dc2f6202c7de26c8948331c1/azkar.json"
        );
        if (!response.ok) throw new Error("Failed to fetch data.");
        const data = await response.json();
        setAdhkarData(data);
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    }

    fetchAdhkar();
  }, []);

  const cleanText = (text) =>
    text
      ?.replace(/\\n/g, " ")
      .replace(/["']/g, "")
      .replace(/\s+/g, " ")
      .replace(/,/g, " ")
      .trim();

  const isValidEntry = (item) =>
    item?.content &&
    cleanText(item.content).length > 2 &&
    cleanText(item.content) !== ",";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="adhkar-app">
      <h1 className="adhkar-heading">Daily Adhkar</h1>
      <div className="adhkar-card">
        {selectedCategory ? (
          <div>
            <h2 className="category-title">{selectedCategory}</h2>
            <button
              className="back-button"
              onClick={() => setSelectedCategory(null)}
            >
              Back to Categories
            </button>

            <ul className="adhkar-dua-list">
              {adhkarData[selectedCategory]
                .filter(isValidEntry)
                .map((item, index) => (
                  <li key={index} className="adhkar-item">
                    <p>{cleanText(item.content)}</p>
                    {item.translation && (
                      <p>{cleanText(item.translation)}</p>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        ) : (
          <ul className="adhkar-list">
            {Object.keys(adhkarData).map((category) => (
              <li key={category}>
                <button onClick={() => setSelectedCategory(category)}>
                  {category}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Scroll to Top Button */}
      <button className="scroll-to-top" onClick={scrollToTop}>
        ⇑
      </button>
    </div>
  );
}

export default AdhkarApp;
