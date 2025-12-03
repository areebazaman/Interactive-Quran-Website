import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment"; // Ensure this is installed
// Removed 'moment/locale/ar' to avoid Arabic numerals
import "../css/PrayerTimes.css";

moment.locale('en'); // Set moment locale to English explicitly

const PrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [location, setLocation] = useState({ city: "Loading..." });
  const [currentPrayer, setCurrentPrayer] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [hijriDate, setHijriDate] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      // Fetch prayer times
      const { data } = await axios.get(
        `https://api.aladhan.com/v1/timings/${Math.floor(Date.now() / 1000)}?latitude=${latitude}&longitude=${longitude}&method=1`

      );
      setPrayerTimes(data.data.timings);

      // Fetch location
      const locationData = await axios.get(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      setLocation(locationData.data);

      // Set Hijri date
      const hijri = data.data.date.hijri;
      setHijriDate(`${hijri.day} ${hijri.month.en} ${hijri.year}`);

      // Update current and next prayer
      updateCurrentAndNextPrayer(data.data.timings);
    });
  }, []);

  const updateCurrentAndNextPrayer = (timings) => {
    const now = moment();
    const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    const times = prayerOrder.map((p) => ({
      name: p,
      time: moment(timings[p], "HH:mm"),
    }));

    let current = null;
    let next = null;

    for (let i = 0; i < times.length; i++) {
      if (now.isBefore(times[i].time)) {
        current = times[i - 1] || times[times.length - 1];
        next = times[i];
        break;
      }
    }

    if (!current || !next) {
      current = times[times.length - 1];
      next = times[0];
    }

    setCurrentPrayer({ name: current.name, time: timings[current.name] });
    setNextPrayer({ name: next.name, time: timings[next.name] });
  };

  const formatTime = (time) => {
    return moment(time, "HH:mm").locale("en").format("hh:mm A"); // Ensure English
  };

  const getCountdownToNextPrayer = (nextTime) => {
    const [nextHours, nextMinutes] = nextTime.split(":").map(Number);
    const now = new Date();
    const next = new Date();
    next.setHours(nextHours);
    next.setMinutes(nextMinutes);
    next.setSeconds(0);

    if (next < now) {
      next.setDate(now.getDate() + 1); // handle after midnight
    }

    const diff = next - now;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours} Hour${hours !== 1 ? "s" : ""} ${minutes} Minute${minutes !== 1 ? "s" : ""}`;
  };

  return (
    <div className="prayer-card">
      <div className="prayer-header">
        <div className="user-info">
          <div className="user-greeting">Assalamu’alaikum,</div>
          <div className="user-name"></div>
        </div>
        <div className="location-info">
          <strong>📍 {location.city}</strong>
          <div>{hijriDate}</div>
        </div>
      </div>

      {prayerTimes ? (
        <>
          <div className="current-prayer-section">
            <div className="current-prayer-name">{currentPrayer?.name}</div>
            <div className="current-prayer-time">
              {formatTime(currentPrayer?.time)}
            </div>
            <div className="next-countdown">
              {nextPrayer && (
                <>
                  {getCountdownToNextPrayer(nextPrayer.time)} until {nextPrayer.name}
                </>
              )}
            </div>
          </div>

          <div className="prayer-times-strip">
            {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((prayer) => (
              <div key={prayer} className="prayer-slot">
                <div className="prayer-label">{prayer}</div>
                <div className="prayer-time-strip">
                  {formatTime(prayerTimes[prayer])}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Loading prayer times...</p>
      )}
    </div>
  );
};

export default PrayerTimes;
