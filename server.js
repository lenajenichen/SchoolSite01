const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

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

async function createTable() {
    try {
        const client = await pool.connect();
        await client.query(`
            CREATE TABLE IF NOT EXISTS fobis (
                id SERIAL PRIMARY KEY,
                thema TEXT NOT NULL,
                titel TEXT NOT NULL,
                date_ranges JSONB NOT NULL,
                lehrer TEXT NOT NULL
            )
        `);
        client.release();
        console.log('Tabelle "fobis" erfolgreich erstellt oder existiert bereits.');
    } catch (err) {
        console.error('Fehler beim Erstellen der Tabelle:', err);
    }
}

createTable();

app.get('/entries', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, thema, titel, date_ranges, lehrer FROM fobis');
        res.json(result.rows);
    } catch (err) {
        console.error('Fehler beim Abrufen der Daten:', err);
        res.status(500).send('Serverfehler');
    }
});

app.post('/entries', async (req, res) => {
    const { thema, titel, dateRanges, lehrer } = req.body;

    if (!thema || !titel || !dateRanges || !lehrer) {
        return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
    }

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await client.query(
                'INSERT INTO fobis (thema, titel, date_ranges, lehrer) VALUES ($1, $2, $3, $4) RETURNING id',
                [thema, titel, JSON.stringify(dateRanges), lehrer]
            );
            await client.query('COMMIT');
            res.status(201).json({ message: 'Eintrag hinzugefügt', id: result.rows[0].id });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Fehler beim Hinzufügen:', error);
            res.status(500).json({ error: 'Datenbankfehler' });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Fehler beim Abrufen der Daten:', err);
        res.status(500).send('Serverfehler');
    }
});

app.put('/entries/:id', async (req, res) => {
    const { id } = req.params;
    const { thema, titel, dateRanges, lehrer } = req.body;

    if (!thema || !titel || !dateRanges || !lehrer) {
        return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
    }

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(
                'UPDATE fobis SET thema = $1, titel = $2, date_ranges = $3, lehrer = $4 WHERE id = $5',
                [thema, titel, JSON.stringify(dateRanges), lehrer, id]
            );
            await client.query('COMMIT');
            res.status(200).json({ message: 'Eintrag aktualisiert' });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Fehler beim Aktualisieren:', error);
            res.status(500).json({ error: 'Datenbankfehler' });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Fehler beim Abrufen der Daten:', err);
        res.status(500).send('Serverfehler');
    }
});

app.delete('/entries/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM fobis WHERE id = $1', [id]);
            await client.query('COMMIT');
            res.status(200).json({ message: 'Eintrag gelöscht' });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Fehler beim Löschen:', error);
            res.status(500).json({ error: 'Datenbankfehler' });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Fehler beim Abrufen der Daten:', err);
        res.status(500).send('Serverfehler');
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});