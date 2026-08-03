const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rollNo TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      mergeSortMarks INTEGER DEFAULT 0,
      binarySearchMarks INTEGER DEFAULT 0,
      matrixMultMarks INTEGER DEFAULT 0,
      totalScore INTEGER DEFAULT 0,
      timeTaken INTEGER DEFAULT 0,
      violations INTEGER DEFAULT 0,
      submittedAt DATETIME,
      codeMergeSort TEXT,
      codeBinarySearch TEXT,
      codeMatrixMult TEXT,
      languageMergeSort TEXT DEFAULT 'java',
      languageBinarySearch TEXT DEFAULT 'java',
      languageMatrixMult TEXT DEFAULT 'java'
    )`, (err) => {
      if (err) {
        console.error('Error creating table', err.message);
      } else {
        // Try to add columns if table already existed without them
        db.run('ALTER TABLE candidates ADD COLUMN languageMergeSort TEXT DEFAULT "java"', () => {});
        db.run('ALTER TABLE candidates ADD COLUMN languageBinarySearch TEXT DEFAULT "java"', () => {});
        db.run('ALTER TABLE candidates ADD COLUMN languageMatrixMult TEXT DEFAULT "java"', () => {});
      }
    });
  }
});

module.exports = db;
