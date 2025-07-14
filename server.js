const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

let videos = [];

// Upload endpoint
app.post('/api/upload', upload.single('video'), (req, res) => {
  const { title, category } = req.body;
  if (!req.file || !title || !category) {
    return res.status(400).json({ error: 'Dados incompletos.' });
  }
  const video = {
    id: Date.now(),
    title,
    category,
    url: `/uploads/${req.file.filename}`
  };
  videos.unshift(video);
  res.json(video);
});

// List videos
app.get('/api/videos', (req, res) => {
  res.json(videos);
});

// Delete video
app.delete('/api/videos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const video = videos.find(v => v.id === id);
  if (video) {
    // Remove arquivo físico
    const filePath = path.join(__dirname, video.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  videos = videos.filter(v => v.id !== id);
  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
