require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// SQLite Database setup
const db = new sqlite3.Database(process.env.DATABASE_PATH || '/mnt/data/database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        // Create the table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                rank TEXT,
                name TEXT,
                decoration TEXT,
                remarks TEXT,
                signature TEXT
            )
        `);
    }
});

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public', 'index.html'));
});

// Serve local PDF
app.get('/view-pdf', (req, res) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(path.join(__dirname, 'public','VISITOR-BOOK-ABOUT-US.pdf'), (err) => {
        if (err) {
            console.error(err);
            res.status(404).send('PDF file not found');
        }
    });
});

// Handle form submission (new entry)
app.post('/submit-entry', (req, res) => {
    const { date, rank, name, decoration, remarks, signature } = req.body;

    // Validate input data
    if (!date || !rank || !name || !decoration || !remarks || !signature) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    // Insert data into SQLite database
    const query = `
        INSERT INTO entries (date, rank, name, decoration, remarks, signature)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [date, rank, name, decoration, remarks, signature], function(err) {
        if (err) {
            console.error('Database Insert Error:', err);
            return res.status(500).json({ error: 'Failed to insert data into the database.' });
        }
        res.status(200).json({ message: 'Entry submitted successfully!' });
    });
});

// Fetch all entries
app.get('/get-entries', (req, res) => {
    const query = 'SELECT * FROM entries';
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve entries.' });
        }
        res.json(rows);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
