const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Enable CORS for frontend communication
app.use(cors());
app.use(express.json());

// Create 'recitations' directory if not exists
const RECITATIONS_DIR = path.join(__dirname, "recitations");
if (!fs.existsSync(RECITATIONS_DIR)) {
    fs.mkdirSync(RECITATIONS_DIR);
}

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: RECITATIONS_DIR,
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);
        const fileName = `recitation_${Date.now()}${fileExt}`;
        cb(null, fileName);
    },
});

const upload = multer({ storage });

// 📌 Route to Upload Audio
app.post("/upload-recitation", upload.single("audio"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded!" });
    }

    return res.json({
        message: "Recitation saved successfully!",
        filename: req.file.filename,
        filepath: `/recitations/${req.file.filename}`,
    });
});

// 📌 Route to Fetch All Saved Recitations
app.get("/get-recitations", (req, res) => {
    fs.readdir(RECITATIONS_DIR, (err, files) => {
        if (err) {
            return res.status(500).json({ message: "Error reading directory!" });
        }
        res.json(files);
    });
});

// 📌 Serve Recitations Publicly
app.use("/recitations", express.static(RECITATIONS_DIR));

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
