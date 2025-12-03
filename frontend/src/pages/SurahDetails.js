import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import levenshtein from "fast-levenshtein";
import { BiMicrophone, BiMicrophoneOff, BiPlayCircle, BiPauseCircle } from "react-icons/bi";
import "../css/SurahDetails.css";

const surahNameMap = {
  "fatihah": 1, "baqarah": 2, "aaliimran": 3, "annisa": 4, "maidah": 5,
  "anam": 6, "araf": 7, "anfal": 8, "attawbah": 9, "yunus": 10,
  "hud": 11, "yusuf": 12, "arrad": 13, "ibrahim": 14, "hijr": 15,
  "annahl": 16, "isra": 17, "kahf": 18, "maryam": 19, "taha": 20,
  "anbiya": 21, "hajj": 22, "muminun": 23, "annur": 24, "furqan": 25,
  "ashshuara": 26, "annaml": 27, "qasas": 28, "ankabut": 29, "arrum": 30,
  "luqman": 31, "assajdah": 32, "ahzab": 33, "saba": 34, "fatir": 35,
  "yasin": 36, "assaffat": 37, "sad": 38, "azzumar": 39, "ghafir": 40,
  "fussilat": 41, "ashshura": 42, "azzukhruf": 43, "addukhan": 44, "jathiyah": 45,
  "ahqaf": 46, "muhammad": 47, "fath": 48, "hujurat": 49, "qaf": 50,
  "adhdhariyat": 51, "attur": 52, "annajm": 53, "qamar": 54, "arrahman": 55,
  "waqiah": 56, "hadid": 57, "mujadila": 58, "hashr": 59, "mumtahanah": 60,
  "assaff": 61, "jumuah": 62, "munafiqun": 63, "attaghabun": 64, "attalaq": 65,
  "attahrim": 66, "mulk": 67, "qalam": 68, "haqqah": 69, "maarij": 70,
  "nuh": 71, "jinn": 72, "muzzammil": 73, "muddaththir": 74, "qiyamah": 75,
  "insan": 76, "mursalat": 77, "annaba": 78, "annaziat": 79, "abasa": 80,
  "attakwir": 81, "infitar": 82, "mutaffifin": 83, "inshiqaq": 84, "buruj": 85,
  "attariq": 86, "ala": 87, "ghashiyah": 88, "fajr": 89, "balad": 90,
  "ashshams": 91, "layl": 92, "adduha": 93, "ashsharh": 94, "attin": 95,
  "alaq": 96, "qadr": 97, "bayyinah": 98, "azzalzalah": 99, "adiyat": 100,
  "qariah": 101, "attakathur": 102, "asr": 103, "humazah": 104, "fil": 105,
  "quraysh": 106, "maun": 107, "kawthar": 108, "kafirun": 109, "annasr": 110,
  "masad": 111, "ikhlas": 112, "falaq": 113, "annas": 114
};


const languageMapping = {
  en: "English", ur: "Urdu", ar: "Arabic", bn: "Bengali", fr: "French", de: "German",
  id: "Indonesian", ml: "Malayalam", fa: "Persian", pt: "Portuguese", ru: "Russian",
  es: "Spanish", tr: "Turkish", hi: "Hindi",
};

const removeDiacritics = (text) => text.replace(/َ|ً|ُ|ٌ|ِ|ٍ|ْ|ّ/g, "").trim();

function SurahDetails() {
  const { number } = useParams();
  const navigate = useNavigate();
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [surahName, setSurahName] = useState("");
  const [selectedTranslation, setSelectedTranslation] = useState(null);
  const [translationOptions, setTranslationOptions] = useState([]);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [userRecitation, setUserRecitation] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);

  const audioChunksRef = useRef([]);
  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  useEffect(() => {
    axios.get("https://api.alquran.cloud/v1/edition?format=text&type=translation")
      .then((response) => {
        const formattedOptions = response.data.data.map((edition) => ({
          value: edition.identifier,
          label: `${languageMapping[edition.language] || edition.language} (${edition.englishName})`,
          language: edition.language,
        }));
        setTranslationOptions(formattedOptions);
        setSelectedTranslation(formattedOptions.find((option) => option.value === "en.asad"));
      })
      .catch((error) => console.error("Error fetching translations:", error));
  }, []);

  useEffect(() => {
    if (!selectedTranslation) return;

    axios.get(`https://api.alquran.cloud/v1/surah/${number}/editions/quran-simple-min,${selectedTranslation.value}`)
      .then((response) => {
        const [arabicData, translationData] = response.data.data;
        const mergedVerses = arabicData.ayahs.map((ayah, index) => ({
          number: ayah.numberInSurah,
          arabic: ayah.text,
          translation: translationData.ayahs[index].text,
          audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`,
        }));
        setSurahName(arabicData.englishName);
        setVerses(mergedVerses);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching Surah verses:", error);
        setLoading(false);
      });
  }, [number, selectedTranslation]);

  useEffect(() => {
    if (selectedVerse && transcript) {
      setUserRecitation(transcript);
    }

    if (isVoiceSearching) {
      const normalizedTranscript = transcript.toLowerCase().replace("surah", "").trim();
      for (const [name, num] of Object.entries(surahNameMap)) {
        if (normalizedTranscript.includes(name)) {
          SpeechRecognition.stopListening();
          resetTranscript();
          setIsVoiceSearching(false);
          navigate(`/surah/${num}`);
          break;
        }
      }
    }
  }, [transcript]);

  useEffect(() => {
    const surahNum = parseInt(searchInput.trim());
    if (!isNaN(surahNum) && surahNum >= 1 && surahNum <= 114) {
      navigate(`/surah/${surahNum}`);
    }
  }, [searchInput]);

  const startVoiceSearch = () => {
    setIsVoiceSearching(true);
    resetTranscript();
    SpeechRecognition.startListening({ language: "en-US", continuous: false });
  };

  const stopVoiceSearch = () => {
    SpeechRecognition.stopListening();
    setIsVoiceSearching(false);
  };

  const startListening = async (verse) => {
    setSelectedVerse(verse);
    setUserRecitation("");
    resetTranscript();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recitation.wav");
        formData.append("surah", surahName);
        formData.append("verse", verse.number);

        try {
          await axios.post("http://localhost:5000/upload-recitation", formData);
        } catch (error) {
          console.error("Error uploading audio:", error);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
    }

    SpeechRecognition.startListening({ continuous: true, language: "ar-SA" });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    checkPronunciation();

    if (mediaRecorder) {
      mediaRecorder.stop();
      const tracks = mediaRecorder.stream?.getTracks();
      tracks?.forEach((track) => track.stop());
    }
  };

  const playCorrectionAudio = (audioUrl) => {
    if (currentAudio && isPlaying) {
      currentAudio.pause();
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.play();
    setCurrentAudio(audio);
    setIsPlaying(true);

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    };
  };

  const splitLettersAndHarakats = (text) => {
    const result = [];
    const regex = /([\u0621-\u064A])([\u064B-\u0652]*)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      result.push({ letter: match[1], harakat: match[2] || "" });
    }

    return result;
  };

  const compareWords = (correctText, userText) => {
    const correctWords = correctText.trim().split(" ");
    const userWords = removeDiacritics(userText.trim()).split(" ");

    return correctWords.map((correctWord, wordIdx) => {
      const correctLetters = splitLettersAndHarakats(correctWord);
      const userWord = userWords[wordIdx] || "";
      const userLetters = userWord.split("");

      let html = "";

      for (let i = 0; i < correctLetters.length; i++) {
        const correct = correctLetters[i];
        const userLetter = userLetters[i] || "";

        html += `<span class="${correct.letter !== userLetter ? 'incorrect' : 'spoken-correct'}">${correct.letter}${correct.harakat}</span>`;
      }

      return `<span class="word">${html}</span>`;
    }).join(" ");
  };

  const checkPronunciation = () => {
    if (!selectedVerse) return;

    const correctText = removeDiacritics(selectedVerse.arabic);
    const userText = removeDiacritics(userRecitation);

    const distance = levenshtein.get(correctText, userText);
    const similarity = 1 - distance / Math.max(correctText.length, userText.length);

    if (similarity < 0.95) {
      playCorrectionAudio(selectedVerse.audio);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="surah-details-container">
      <div className="surah-header">
        <button className="nav-button" onClick={() => navigate(`/surah/${Math.max(1, Number(number) - 1)}`)} disabled={Number(number) === 1}>↞</button>
        <h2 className="surah-title">{surahName}</h2>
        <button className="nav-button" onClick={() => navigate(`/surah/${Math.min(114, Number(number) + 1)}`)} disabled={Number(number) === 114}>↠</button>
      </div>

      <p className="basmala">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>

      <div className="search-language-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Enter Surah Number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input-q"
          />
          <button className="mic-inside-input" onClick={isVoiceSearching ? stopVoiceSearch : startVoiceSearch}>
            {isVoiceSearching ? <BiMicrophoneOff /> : <BiMicrophone />}
          </button>
        </div>

        <Select options={translationOptions} value={selectedTranslation} onChange={setSelectedTranslation} className="language-select" />
      </div>

      <div className="verses-container">
        {verses.map((verse) => (
          <div key={verse.number} className="verse-block">
            <p className="arabic-text" dangerouslySetInnerHTML={{
              __html: selectedVerse && selectedVerse.number === verse.number
                ? compareWords(verse.arabic, userRecitation)
                : verse.arabic
            }} />
            <p className="translation-text">{verse.translation}</p>
            <div className="recite-buttons">
              <button className="mic-button start" onClick={() => startListening(verse)}><BiMicrophone /></button>
              <button className="mic-button stop" onClick={stopListening} disabled={!listening}><BiMicrophoneOff /></button>
              <button className="mic-button pause" onClick={() => playCorrectionAudio(verse.audio)}>
                {isPlaying ? <BiPauseCircle /> : <BiPlayCircle />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SurahDetails;
