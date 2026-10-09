# GMS Property Console

A property-management demo built with a NestJS API, a TypeScript browser client, and Tailwind CSS.
The responsive light-theme interface uses a sidebar for navigation; selecting a property opens its overview.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```bash
npm install
npm run build
npm start
```

Open `http://localhost:3000`. The API and built frontend are served from the same NestJS application.

For backend watch mode, build the frontend first with `npm run build`, then run `npm run start:dev`.

## API

- `GET /api/properties` — list properties
- `POST /api/properties` — submit a property registration
- `PATCH /api/properties/:id/status` — approve, reject, suspend, or restore a property
- `POST /api/properties/:id/access-hold` — suspend access for 1 hour, 24 hours, or 7 days

The API validates request bodies and records status changes and access holds in each property's action log. Demo data is held in memory and resets when the server restarts; this sample has no authentication or persistent database.
