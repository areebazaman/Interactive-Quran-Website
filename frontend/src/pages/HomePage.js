import React, { useEffect, useState } from 'react';
import PrayerTimes from './PrayerTimes';
import AyatOfTheDay from './AyatOfTheDay';
import HadithOfTheDay from './HadithOfTheDay';
import '../css/HomePage.css';

const components = [
  <AyatOfTheDay key="ayah" />,
  <HadithOfTheDay key="hadith" />,
  <PrayerTimes key="prayer" />
];

const HomePage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % components.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? components.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="carousel-container">
      <button className="carousel-btn prev" onClick={goToPrev}>‹</button>

      <div className="carousel-card fade-in">
        {components[currentIndex]}
      </div>

      <button className="carousel-btn next" onClick={goToNext}>›</button>

      <div className="carousel-dots">
        {components.map((_, index) => (
          <div
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
