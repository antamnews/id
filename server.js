const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

// sample providers & games
const PROVIDERS = ['Pragmatic Play','PG Soft','Habanero','Joker Gaming','Playtech','NetEnt'];
const GAMES = [
  'Starlight Princess','Gates of Olympus','Sweet Bonanza','Wild West Gold','Mahjong Ways','Wolf Gold'
];

// internal state: current snapshot
let snapshot = generateSnapshot();

function rand(min, max) { return Math.random() * (max - min) + min; }

function generateSnapshot() {
  const now = new Date().toISOString();
  const data = GAMES.map((game, i) => {
    const provider = PROVIDERS[i % PROVIDERS.length];
    // Simulate RTP between 92 - 98, winrate between 0.5% - 8%
    const rtp = +(rand(92, 98) + (Math.sin(Date.now()/100000 + i) * 0.3)).toFixed(2);
    const winrate = +rand(0.5, 8).toFixed(2);
    const plays = Math.floor(rand(100, 5000));
    return { id: i+1, game, provider, rtp, winrate, plays, updated_at: now };
  });
  return { generated_at: now, data };
}

// Periodically mutate snapshot to simulate live updates
setInterval(() => {
  // random small changes
  snapshot.data = snapshot.data.map((row, idx) => {
    const rtpDelta = rand(-0.25, 0.25);
    const winDelta = rand(-0.6, 0.6);
    const playsDelta = Math.floor(rand(0, 50));
    const rtp = Math.max(80, Math.min(99.99, +(row.rtp + rtpDelta).toFixed(2)));
    const winrate = Math.max(0, +(row.winrate + winDelta).toFixed(2));
    return { ...row, rtp, winrate, plays: row.plays + playsDelta, updated_at: new Date().toISOString() };
  });
  snapshot.generated_at = new Date().toISOString();
}, 5000 + Math.floor(Math.random()*2000));

// REST: latest snapshot
app.get('/api/winrate/latest', (req, res) => {
  res.json(snapshot);
});

// SSE: stream updates
app.get('/api/winrate/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // send initial snapshot
  res.write(`data: ${JSON.stringify(snapshot)}\n\n`);

  const timer = setInterval(() => {
    // send incremental update (could optimize to only diffs)
    res.write(`data: ${JSON.stringify(snapshot)}\n\n`);
  }, 4000 + Math.floor(Math.random()*2000));

  req.on('close', () => {
    clearInterval(timer);
  });
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
