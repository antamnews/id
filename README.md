# Winrate Slot — RTP Live (Demo)

Simple demo app that simulates live RTP & winrate data for slot games and exposes:
- `GET /api/winrate/latest` — JSON snapshot
- `GET /api/winrate/stream` — Server-Sent Events (SSE) streaming updates

## Run locally
1. Install Node.js (v16+ recommended)
2. `npm install`
3. `node server.js`
4. Open http://localhost:3000

## Notes
- This project uses simulated data. Replace generator logic with real data sources for production.
- For large-scale real-time use, consider WebSocket + Redis pub/sub.
