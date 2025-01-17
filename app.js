require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;
const fs = require('fs');
const dbPath = process.env.DATABASE_PATH || '/mnt/data/database.db';
let db ;
// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Check if the directory exists
fs.access('/mnt/data', fs.constants.F_OK, (err) => {
    if (err) {
        console.error("Directory /mnt/data does not exist or is not accessible.");
        // Create the directory
        fs.mkdir('/mnt/data', { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating /mnt/data directory:', err);
                return; // If directory creation fails, don't proceed with database
            }
            console.log('/mnt/data directory created successfully.');
            
            // Now try to open the database
            openDatabase();
        });
    } else {
        console.log("/mnt/data directory is accessible.");
        openDatabase();
    }
});

// Function to open the SQLite database
function openDatabase() {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err);
        } else {
            console.log('Database opened successfully at path:', dbPath);
        }
    });
}

// Check if the database file exists
fs.access(dbPath, fs.constants.F_OK, (err) => {
    if (err) {
        console.log(`Database file does not exist at ${dbPath}. It will be created.`);
    } else {
        console.log(`Database file exists at ${dbPath}.`);
    }
});

// SQLite Database setup
console.log("Database Path:", dbPath);

function openDatabase() {
 db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Database opened successfully');
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
}
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
