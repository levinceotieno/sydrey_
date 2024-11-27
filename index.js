const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Test route
app.get('/', (req, res) => {
  db.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
      res.status(500).send('Database connection error');
      return;
    }
    res.send('Database is working: ' + results[0].result);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
