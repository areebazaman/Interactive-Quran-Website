import React, { useEffect, useState } from "react";
import axios from "axios";

const Prayer = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [currentPrayer, setCurrentPrayer] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [isRamadan, setIsRamadan] = useState(false);
  const [hijriDate, setHijriDate] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchPrayerTimes(latitude, longitude);
      },
      (error) => console.error("Error fetching location:", error)
    );
  }, []);

  const fetchPrayerTimes = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.aladhan.com/v1/timingsByCity?latitude=${lat}&longitude=${lon}&method=2`
      );

      const timings = response.data.data.timings;
      const hijriMonth = response.data.data.date.hijri.month.en;

      setPrayerTimes(timings);
      setHijriDate(`${response.data.data.date.hijri.day} ${hijriMonth} ${response.data.data.date.hijri.year}`);
      setIsRamadan(hijriMonth === "Ramadan");
      determineCurrentAndNextPrayer(timings);
    } catch (error) {
      console.error("Error fetching prayer times:", error);
    }
  };

  const determineCurrentAndNextPrayer = (timings) => {
    const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    let found = false;

    for (let i = 0; i < prayerNames.length; i++) {
      const prayerTime = convertTimeToMinutes(timings[prayerNames[i]]);
      const nextPrayerTime = convertTimeToMinutes(timings[prayerNames[i + 1]]);

      if (currentTime >= prayerTime && (!nextPrayerTime || currentTime < nextPrayerTime)) {
        setCurrentPrayer({ name: prayerNames[i], time: timings[prayerNames[i]] });
        setNextPrayer(prayerNames[i + 1] ? { name: prayerNames[i + 1], time: timings[prayerNames[i + 1]] } : null);
        found = true;
        break;
      }
    }

    if (!found) {
      setCurrentPrayer(null);
      setNextPrayer({ name: "Fajr", time: timings["Fajr"] });
    }
  };

  const convertTimeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  return (
    <div className="prayer-times-container">
      <h2>Prayer Times</h2>
      <p>Islamic Date: {hijriDate}</p>

      {currentPrayer && (
        <div className="current-prayer">
          <p>Now Time: <strong>{currentPrayer.name}</strong></p>
          <p>{currentPrayer.time}</p>
        </div>
      )}

      {nextPrayer && (
        <div className="next-prayer">
          <p>Next Prayer: <strong>{nextPrayer.name}</strong></p>
          <p>{nextPrayer.time}</p>
        </div>
      )}

      {prayerTimes && (
        <div>
          <p>Sunrise: {prayerTimes.Sunrise}</p>
          {isRamadan && (
            <div className="ramadan-times">
              <p>Suhoor: {prayerTimes.Fajr}</p>
              <p>Iftar: {prayerTimes.Maghrib}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Prayer;
