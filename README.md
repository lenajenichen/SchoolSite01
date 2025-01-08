# Fortbildungsübersicht

## Voraussetzungen

Bevor du das Projekt startest, stelle sicher, dass die folgenden Voraussetzungen auf deinem System erfüllt sind:

- **Node.js**: Version 10.5 oder höher. [Node.js herunterladen](https://nodejs.org/)
- **PostgreSQL**: Es gibt zwei Möglichkeiten, PostgreSQL zu verwenden:
  1. **Lokale Installation**:
     - Lade PostgreSQL herunter und installiere es von [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/).
  2. **Docker Container**:
     - Stelle sicher, dass Docker installiert ist.
     - Starte PostgreSQL mit folgendem Befehl:
       ```bash
       docker run --name postgres-container -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
       ```
     - Dieser Befehl startet einen PostgreSQL-Container mit dem Standardport 5432 und einem Passwort `mysecretpassword`.

## Installation

1. **Repository klonen**
   ```bash
   git clone <URL-zu-deinem-Repository>
   cd <Projektordner>
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm install express
   npm install pg
   npm install cors
   ```

## Projekt starten

1. Stelle sicher, dass die PostgreSQL-Datenbank läuft (entweder lokal oder über Docker).
2. Führe das Projekt aus:
   ```bash
   node server.js
   ```

## Konfiguration

Ersetze in der server.js die vorhandenen Daten mit deinen Datenbank daten.

```
const pool = new Pool({
    user: 'fobi',
    host: 'localhost',
    database: 'fobi',
    password: 'FoBiIstCool123',
    port: 5432,
});
```
