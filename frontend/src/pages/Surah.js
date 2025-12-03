import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AudioPlayer from '../components/AudioPlayer';  // Ensure correct path

const Surah = () => {
  const { id } = useParams();
  const [surah, setSurah] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');

  useEffect(() => {
    axios.get(`https://api.alquran.cloud/v1/surah/${id}`)
      .then(response => {
        setSurah(response.data.data);
      })
      .catch(error => console.error(error));
  }, [id]);

  const playAudio = (ayahNumber) => {
    setAudioUrl(`https://verses.quran.com/${id}/${ayahNumber}.mp3`);
  };

  return (
    <div>
      {surah ? (
        <>
          <h2>{surah.name} ({surah.englishName})</h2>
          <div className="list-group">
            {surah.ayahs.map((ayah) => (
              <div key={ayah.number} className="list-group-item">
                <p>{ayah.text}</p>
                <button onClick={() => playAudio(ayah.number)} className="btn btn-primary">Play</button>
              </div>
            ))}
          </div>
          {audioUrl && <AudioPlayer src={audioUrl} />}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Surah;
