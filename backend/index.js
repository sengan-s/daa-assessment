const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const problems = require('./problems');
const { evaluateCode } = require('./judge');

// Initialize SQLite Database
const dbPath = process.env.DB_PATH || path.join(__dirname, 'sqlite.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rollNo TEXT UNIQUE,
      name TEXT,
      mergeSortMarks INTEGER,
      binarySearchMarks INTEGER,
      matrixMultMarks INTEGER,
      totalScore INTEGER,
      timeTaken INTEGER,
      violations INTEGER,
      submittedAt TEXT,
      codeMergeSort TEXT,
      codeBinarySearch TEXT,
      codeMatrixMult TEXT,
      languageMergeSort TEXT,
      languageBinarySearch TEXT,
      languageMatrixMult TEXT
    )`);
  }
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Helper function to evaluate code for a problem
async function evaluateProblem(problemId, code, language, runHidden) {
  const problem = problems[problemId];
  if (!problem) throw new Error('Problem not found');

  const testCasesToRun = runHidden ? problem.testCases : problem.testCases.filter(tc => !tc.isHidden);
  
  return await evaluateCode(problem, code, language, testCasesToRun);
}


// Single run endpoint
app.post('/api/evaluate', async (req, res) => {
  const { problemId, code, language, isSubmit } = req.body;
  try {
    const evalResult = await evaluateProblem(problemId, code, language, isSubmit);
    res.json({ success: true, ...evalResult });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Final submit endpoint
app.post('/api/submit', async (req, res) => {
  console.log('Received /api/submit request for:', req.body.rollNo);
  const { rollNo, name, codePerProblem, languagePerProblem, timeTaken, violations } = req.body;
  
  if (!rollNo || !name) {
    return res.status(400).json({ success: false, error: 'Missing rollNo or name' });
  }

  try {
    let totalScore = 0;
    const scores = {};

    for (const [problemId, code] of Object.entries(codePerProblem)) {
      const language = languagePerProblem[problemId] || 'java';
      if (code && code.trim() !== '') {
        const evalResult = await evaluateProblem(problemId, code, language, true);
        scores[problemId] = evalResult.marks;
        totalScore += evalResult.marks;
      } else {
        scores[problemId] = 0;
      }
    }

    const { mergeSort, binarySearch, matrixMult } = scores;
    console.log('Finished evaluating all problems. Scores:', scores);

    // Check if candidate already exists
    console.log('Executing DB check for rollNo:', rollNo);
    db.get('SELECT id FROM candidates WHERE rollNo = ?', [rollNo], (err, row) => {
      console.log('DB check completed. err:', err, 'row:', !!row);
      if (err) return res.status(500).json({ success: false, error: 'Database error' });
      
      const submittedAt = new Date().toISOString();

      if (row) {
        // Update existing
        db.run(`UPDATE candidates SET 
          name = ?, mergeSortMarks = ?, binarySearchMarks = ?, matrixMultMarks = ?, 
          totalScore = ?, timeTaken = ?, violations = ?, submittedAt = ?, 
          codeMergeSort = ?, codeBinarySearch = ?, codeMatrixMult = ?,
          languageMergeSort = ?, languageBinarySearch = ?, languageMatrixMult = ?
          WHERE rollNo = ?`, 
          [name, scores['mergeSort'] || 0, scores['binarySearch'] || 0, scores['matrixMult'] || 0, 
           totalScore, timeTaken, violations, submittedAt,
           codePerProblem['mergeSort'], codePerProblem['binarySearch'], codePerProblem['matrixMult'],
           languagePerProblem['mergeSort'] || 'java', languagePerProblem['binarySearch'] || 'java', languagePerProblem['matrixMult'] || 'java',
           rollNo], 
          function(err) {
            if (err) return res.status(500).json({ success: false, error: 'Update failed' });
            res.json({ success: true, totalScore, scores });
          }
        );
      } else {
        // Insert new
        db.run(`INSERT INTO candidates (
          rollNo, name, mergeSortMarks, binarySearchMarks, matrixMultMarks,
          totalScore, timeTaken, violations, submittedAt, 
          codeMergeSort, codeBinarySearch, codeMatrixMult,
          languageMergeSort, languageBinarySearch, languageMatrixMult
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [rollNo, name, scores['mergeSort'] || 0, scores['binarySearch'] || 0, scores['matrixMult'] || 0, 
         totalScore, timeTaken, violations, submittedAt,
         codePerProblem['mergeSort'], codePerProblem['binarySearch'], codePerProblem['matrixMult'],
         languagePerProblem['mergeSort'] || 'java', languagePerProblem['binarySearch'] || 'java', languagePerProblem['matrixMult'] || 'java'],
         function(err) {
           if (err) return res.status(500).json({ success: false, error: 'Insert failed' });
           res.json({ success: true, totalScore, scores });
         }
        );
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === '250806') {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password' });
  }
});

// Admin Results
app.get('/api/admin/results', (req, res) => {
  db.all('SELECT * FROM candidates ORDER BY submittedAt DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    } else {
      res.json({ success: true, results: rows });
    }
  });
});

// Admin Delete Candidate
app.delete('/api/admin/results/:rollNo', (req, res) => {
  const { rollNo } = req.params;
  db.run('DELETE FROM candidates WHERE rollNo = ?', [rollNo], function(err) {
    if (err) {
      res.status(500).json({ success: false, error: 'Failed to delete' });
    } else {
      res.json({ success: true, deletedRows: this.changes });
    }
  });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
