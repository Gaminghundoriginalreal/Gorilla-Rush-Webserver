const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;
const upload = multer({ dest: 'uploads/' });

const db = new sqlite3.Database('./forum.db', (err) => {
    if (err) throw err;
    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image TEXT
    )`);
});

app.use(express.static('uploads'));
app.use(express.json());

app.post('/api/posts', upload.single('image'), (req, res) => {
    const { title, content } = req.body;
    const image = req.file ? req.file.filename : null;
    db.run(`INSERT INTO posts (title, content, image) VALUES (?, ?, ?)`, [title, content, image], function (err) {
        if (err) return res.status(500).send('Fehler beim Speichern');
        res.send({ id: this.lastID });
    });
});

app.get('/api/posts', (req, res) => {
    db.all(`SELECT * FROM posts ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).send('Fehler beim Abrufen');
        res.send(rows);
    });
});

app.listen(port, () => console.log(`Forum läuft auf http://localhost:${port}`));
