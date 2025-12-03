



import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/AudiosHistor.css';

const AudiosHistory = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudios = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get-recitations'); // Adjust backend URL
        setAudioFiles(response.data);
      } catch (error) {
        console.error('Error fetching saved audios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAudios();
  }, []);

  return (
    <div className="audios-history-container">
      <h2>Saved Audios</h2>
      {loading ? (
        <p>Loading saved audios...</p>
      ) : audioFiles.length === 0 ? (
        <p>No saved audios found.</p>
      ) : (
        <ul className="audio-list">
          {audioFiles.map((audio, index) => (
            <li key={index} className="audio-item">
              <audio controls>
                <source src={ `http://localhost:5000/recitations/${audio.filename}`} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <span className="audio-name">{audio.filename}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AudiosHistory;  
