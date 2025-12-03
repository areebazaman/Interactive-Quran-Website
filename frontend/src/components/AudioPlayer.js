import React from 'react';

const AudioPlayer = ({ src }) => {
  return (
    <div>
      <audio controls>
        <source src={src} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

export default AudioPlayer;
