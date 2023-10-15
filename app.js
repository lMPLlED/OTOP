const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const fs = require('fs');

const app = express();
const port = 3000;

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API endpoint to add a competitor
app.post('/api/competitors', (req, res) => {
  const name = req.body.name;
  const sql = 'INSERT INTO competitors (name) VALUES (?)';

  db.query(sql, [name], (err, result) => {
    if (err) {
      console.error('Error adding competitor:', err);
      res.status(500).send('Error adding competitor');
    } else {
      res.status(201).send('Competitor added');
    }
  });
});

// API endpoint to add an event
app.post('/api/events', (req, res) => {
  const eventName = req.body.name;
  const points = req.body.points_awarded;
  const sql = 'INSERT INTO events (name, point_value) VALUES (?, ?)';

  db.query(sql, [eventName, points], (err, result) => {
    if (err) {
      console.error('Error adding event:', err);
      res.status(500).send('Error adding event');
    } else {
      res.status(201).send('Event added');
    }
  });
});

// API endpoint to award points to a competitor for an event
app.post('/api/points', (req, res) => {
  const competitorId = req.body.competitorId;
  const eventId = req.body.eventId;
  const pointsAwarded = req.body.points_awarded;
  const sql = 'INSERT INTO points (competitor_id, event_id, points_awarded) VALUES (?, ?, ?)';

  console.log('Request body:', req.body);

  db.query(sql, [competitorId, eventId, pointsAwarded], (err, result) => {
    if (err) {
      console.error('Error awarding points:', err);
      res.status(500).send('Error awarding points');
    } else {
      // Append log entry
      const logEntry = `${new Date().toISOString()} - Competitor ${competitorId} awarded ${pointsAwarded} points for Event ${eventId}\n`;
      fs.appendFile(path.join(__dirname, 'points_awarded.log'), logEntry, (err) => {
        if (err) {
          console.error('Error writing to log file:', err);
        }
      });

      res.status(201).send('Points awarded');
    }
  });
});

// API endpoint to fetch leaderboard data
app.get('/api/leaderboard', (req, res) => {
  const sql = `
  SELECT c.id, c.name, SUM(p.points_awarded) as total_points
  FROM competitors c
  LEFT JOIN points p ON c.id = p.competitor_id
  GROUP BY c.id, c.name
  ORDER BY total_points DESC
`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching leaderboard data:', err);
      res.status(500).send('Error fetching leaderboard data');
    } else {
      res.json(results);
    }
  });
});

// API endpoint to fetch top 5 competitors
app.get('/api/top5', (req, res) => {
  const sql = `
  SELECT c.id, c.name, SUM(p.points_awarded) as total_points
  FROM competitors c
  LEFT JOIN points p ON c.id = p.competitor_id
  GROUP BY c.id, c.name
  ORDER BY total_points DESC
  LIMIT 5
`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching top 5 competitors:', err);
      res.status(500).send('Error fetching top 5 competitors');
    } else {
      res.json(results);
    }
  });
});

// API endpoint to fetch events
app.get('/api/events', (req, res) => {
  const sql = 'SELECT * FROM events';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      res.status(500).send('Error fetching events');
    } else {
      res.json(results);
    }
  });
});

app.get('/api/events/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  const sql = 'SELECT * FROM events WHERE id = ?';

  db.query(sql, [eventId], (err, results) => {
    if (err) {
      console.error('Error fetching event:', err);
      res.status(500).send('Error fetching event');
    } else {
      if (results.length === 0) {
        res.status(404).send('Event not found');
      } else {
        res.json(results[0]);
      }
    }
  });
});

// API endpoint to fetch competitors
app.get('/api/competitors', (req, res) => {
  const sql = 'SELECT * FROM competitors';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching competitors:', err);
      res.status(500).send('Error fetching competitors');
    } else {
      res.json(results);
    }
  });
});


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});



