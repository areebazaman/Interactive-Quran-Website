
import React, { useState, useEffect } from "react";
import "../css/Hadith.css"; // Import the CSS file

const Hadith = () => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [hadiths, setHadiths] = useState([]);
  const [filteredHadiths, setFilteredHadiths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalHadiths, setTotalHadiths] = useState(0);
  const [pageInput, setPageInput] = useState([]);

  const hadithsPerPage = 100;

  const fetchHadiths = (bookId, page) => {
    setLoading(true);

    const rangeStart = (page - 1) * hadithsPerPage + 1;
    const rangeEnd = page * hadithsPerPage;

    // API URL with pagination
    let url = `https://api.hadith.gading.dev/books/${bookId}?range=${rangeStart}-${rangeEnd}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setLoading(false);
          return;
        }

        if (data.data && data.data.hadiths) {
          const updatedHadiths = data.data.hadiths.map((hadith) => ({
            ...hadith,
            translation: hadith["english"] || "Translation not available",
          }));
          setHadiths(updatedHadiths);
          setFilteredHadiths(updatedHadiths);
          setTotalHadiths(data.data.available);
        } else {
          console.error("No Hadiths found in the response.");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching Hadiths:", error);
        setLoading(false);
      });
  };

  const handleBookClick = (bookId) => {
    setSelectedBook(bookId);
    setPage(1); // Reset to page 1 when selecting a new book
    setSearchQuery(""); // Reset search query when selecting a new book
    fetchHadiths(bookId, 1); // Fetch Hadiths when a new book is selected
  };

  useEffect(() => {
    if (selectedBook) {
      fetchHadiths(selectedBook, page);
    }
  }, [selectedBook, page]); // Removed selectedLanguage from dependencies

  // Static Hadith books list
  const hadithBooks = [
    { name: "Sahih al-Bukhari", id: "bukhari" },
    { name: "Sahih Muslim", id: "muslim" },
    { name: "Sunan al-Tirmidhi", id: "tirmidhi" },
    { name: "Musnad Ahmad bin Hanbal", id: "ahmad" },
  ];

  const totalPages = Math.ceil(totalHadiths / hadithsPerPage);

  const handlePageJump = (e) => {
    let pageNumber = parseInt(e.target.value, 10);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      let pageNumber = parseInt(e.target.value, 10);
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setPage(pageNumber);
      }
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      const filtered = hadiths.filter((hadith) => {
        const hadithNumber = hadith.number ? hadith.number.toString() : '';
        const query = searchQuery.trim().toLowerCase();

        // Check if the search query matches the exact Hadith number
        return hadithNumber === query;
      });
      setFilteredHadiths(filtered);
    } else {
      setFilteredHadiths(hadiths); // Reset filter if the search query is empty
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, hadiths]);

  return (
    <div>
      <h1>Hadith Books</h1>

      {/* Display search bar only when a book is selected */}
      {selectedBook && (
        <div className="search-container">
          <input
            type="text"
            placeholder="Search Hadiths..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      <div className="books-container">
        {hadithBooks.map((book) => (
          <button key={book.id} onClick={() => handleBookClick(book.id)}>
            {book.name}
          </button>
        ))}
      </div>

      {selectedBook && (
        <div>
          <h2>Hadiths from {selectedBook}</h2>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="hadith-container">
              {filteredHadiths.length > 0 ? (
                filteredHadiths.map((hadith, index) => {
                  const hadithNumber = (page - 1) * hadithsPerPage + (index + 1);
                  return (
                    <div key={hadith.number} className="hadith-box">
                      <h3>Hadith {hadith.number}</h3>
                      <p className="arabic">{hadith.arab}</p>
                    </div>
                  );
                })
              ) : (
                <p>No Hadiths found for "{searchQuery}"</p>
              )}
            </div>
          )}

          <div className="pagination">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
              Next
            </button>
          </div>

          <div>
            <label>Jump to page:</label>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Hadith;
