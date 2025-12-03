const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create 'recitations' folder if it doesn't exist
const recitationsDir = path.join(__dirname, 'recitations');
if (!fs.existsSync(recitationsDir)) {
  fs.mkdirSync(recitationsDir);
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'recitations/'); // Save files in 'recitations' folder
  },
  filename: (req, file, cb) => {
    const tempFilename = `recitation-${Date.now()}-${Math.round(Math.random() * 1e9)}.wav`;
    cb(null, tempFilename);
  },
});
const upload = multer({ storage });

// Route to handle audio file upload and rename it properly
app.post('/upload-recitation', upload.single('audio'), (req, res) => {
  const { surah, verse } = req.body; // Get Surah name and Ayah number

  console.log('Received File:', req.file);
  console.log('Received Surah:', surah);
  console.log('Received Ayah:', verse);

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  if (!surah || !verse) {
    return res.status(400).json({ message: 'Missing Surah name or Ayah number' });
  }

  // Format Surah name: Replace spaces with underscores and convert to uppercase
  const formattedSurah = surah.trim().replace(/\s+/g, '_').toUpperCase();
  const newFilename = `${formattedSurah}_Ayat_${verse}.wav`;
  const newPath = path.join(recitationsDir, newFilename);
  const oldPath = req.file.path;

  console.log('Old Path:', oldPath);
  console.log('New Filename:', newFilename);
  console.log('New Path:', newPath);

  // Rename the uploaded file
  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      console.error('Error renaming file:', err);
      return res.status(500).json({ message: 'Error saving file' });
    }

    res.json({
      message: 'Recitation saved successfully!',
      filename: newFilename,
      url: `http://localhost:${PORT}/recitations/${newFilename}` // Return file URL
    });
  });
});

// Route to get list of saved recitations
app.get('/get-recitations', (req, res) => {
  fs.readdir(recitationsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching recitations' });
    }

    // Return list of audio files with full URLs
    const recitations = files.map(file => ({
      filename: file,
      url: `http://localhost:${PORT}/recitations/${file}`
    }));

    res.json(recitations);
  });
});

// Serve saved audio files
app.use('/recitations', express.static(recitationsDir));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
