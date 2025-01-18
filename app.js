require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { Pool } = require('pg');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 4000;

// PostgreSQL Database Configuration
// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'regional_network',
//     password: 'admin',
//     port: 5432,
// });

// PostgreSQL Configuration
const isProduction = process.env.NODE_ENV === 'production'
    ? process.env.RENDER_INTERNAL_DATABASE_URL // Use the internal URL in production
    : process.env.RENDER_EXTERNAL_DATABASE_URL;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction
        ? { rejectUnauthorized: false } // For Render
        : false, // For local
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images (JPEG/PNG) are allowed'));
        }
    },
});

// Routes

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the About Us PDF
app.get('/view-pdf', (req, res) => {
    const pdfPath = path.join(__dirname, '/VISITOR-BOOK-ABOUT-US-SC.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(pdfPath);
});

// Handle form submission
app.post('/submit-entry', upload.single('photo'), async (req, res) => {
    const { date, name_rank, address, decoration, remarks, signature} = req.body;
    const photoPath = req.file ? req.file.path : req.body.captured_image;

    if (!date || !name_rank || !address) {
        return res.status(400).json({ error: 'Required fields are missing!' });
    }

    try {
        const client = await pool.connect();

        // Insert into user_data table
        const userDataQuery = `
        INSERT INTO user_data (date, name_rank, address, decoration, remarks, photo_path, signature)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
    `;
    console.log('Inserting values:', date, name_rank, address, decoration, remarks, photoPath, signature);
    console.log('Query:', userDataQuery);
        const result = await client.query(userDataQuery, [
            date,
            name_rank,
            address,
            decoration || null,
            remarks || null,
            photoPath || null,
            signature || null,
        ]);

        client.release();

        res.status(200).json({ message: 'Entry submitted successfully!' });
    } catch (error) {
        console.error('Error inserting entry:', error);
        res.status(500).json({ error: 'Failed to submit data.' });
    }
});

// Fetch entries
app.get('/get-entries', async (req, res) => {
    try {
        const client = await pool.connect();

        const query = `
            SELECT id, date, name_rank, address, decoration, remarks, photo_path, signature
            FROM user_data
        `;
        const result = await client.query(query);

        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching entries:', error);
        res.status(500).json({ error: 'Failed to retrieve entries.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
