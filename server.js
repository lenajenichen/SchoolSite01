const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

app.use(express.json());

const pool = new Pool({
    user: 'fobi',
    host: 'localhost',
    database: 'fobi',
    password: 'FoBiIstCool123',
    port: 5432,
});

app.use(cors());

app.get('/entries', async (req, res) => {
    try {
        const result = await pool.query('SELECT thema, titel, datum, lehrer FROM fobis');
        res.json(result.rows);
        console.log(result.rows.length)
    } catch (err) {
        console.error('Fehler beim Abrufen der Daten:', err);
        res.status(500).send('Serverfehler');
    }
});

app.post('/entries', async (req, res) => {
    const { thema, titel, datum, lehrer } = req.body;

    if (!thema || !titel || !datum || !lehrer) {
        return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
    }

    try {
        await pool.query(
            'INSERT INTO fobis (thema, titel, datum, lehrer) VALUES ($1, $2, $3, $4)',
            [thema, titel, datum, lehrer]
        );
        res.status(201).json({ message: 'Eintrag hinzugefügt' });
    } catch (error) {
        console.error('Fehler beim Hinzufügen:', error);
        res.status(500).json({ error: 'Datenbankfehler' });
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
