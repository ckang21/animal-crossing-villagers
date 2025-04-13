const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());

app.get('/villagers', (req, res) => {
  fs.readFile('../villagers.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Failed to load villagers.');
    }
    const villagers = JSON.parse(data);
    res.json(villagers);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
