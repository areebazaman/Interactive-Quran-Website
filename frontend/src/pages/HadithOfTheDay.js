import React, { useState } from "react";
import "../css/HadithOfTheDay.css";

const hadithCollection = [
    "The best among you are those who have the best manners and character. (Bukhari)",
    "None of you truly believes until he loves for his brother what he loves for himself. (Muslim)",
    "The strong man is not the one who can wrestle, but the one who controls himself when angry. (Bukhari & Muslim)",
    "A smile in the face of your brother is charity. (Tirmidhi)",
    "Allah does not look at your appearance or wealth, but He looks at your hearts and actions. (Muslim)",
    "The most beloved actions to Allah are those that are consistent, even if small. (Bukhari & Muslim)",
    "Whoever follows a path in pursuit of knowledge, Allah will make easy for him a path to Paradise. (Muslim)"
];

const HadithOfTheDay = () => {
    const [hadith, setHadith] = useState(hadithCollection[0]);

    const refreshHadith = () => {
        const randomHadith = hadithCollection[Math.floor(Math.random() * hadithCollection.length)];
        setHadith(randomHadith);
    };

    return (
        <div className="hadith-container">
            <h2>📖 Hadith of the Day</h2>
            <p className="hadith-text">{hadith}</p>
            <button className="refresh-btn" onClick={refreshHadith}>🔄 Refresh Hadith</button>
        </div>
    );
};

export default HadithOfTheDay;
