const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads folder if not exists
if (!fs.existsSync('./Uploads')) {
    fs.mkdirSync('./Uploads');
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Separate audio files into 'Uploads/audio' folder
        if (file.mimetype.startsWith('audio/')) {
            if (!fs.existsSync('./Uploads/audio')) fs.mkdirSync('./Uploads/audio', { recursive: true });
            cb(null, 'Uploads/audio/');
        } else if (file.mimetype.startsWith('image/')) {
            if (!fs.existsSync('./Uploads/image')) fs.mkdirSync('./Uploads/image', { recursive: true });
            cb(null, 'Uploads/image/');
        } else {
            cb(null, 'Uploads/');
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// File type filter
const fileFilter = (req, file, cb) => {
    // Allowed mime types
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
        'audio/mpeg',   // mp3
        'audio/wav',
        'audio/x-wav',
        'audio/m4a'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only images, PDFs, and audio files are allowed!'));
    }
};

// Initialize multer
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for audio files
    fileFilter
});

module.exports = upload;
