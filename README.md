# MyMap

MyMap is a personal Next.js app for saving places on Google Maps, selecting only the places you want to view, auto-fitting the map to those selected markers, measuring straight-line distances, and optionally uploading one image per place to S3-compatible storage.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Auth.js credentials login with optional Google sign-in
- PostgreSQL + Drizzle ORM
- tRPC v11
- React Google Maps

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in your database, auth, Google Maps, and optional object storage values.
3. Install dependencies with `pnpm install`.
4. Generate migrations with `pnpm db:generate`.
5. Apply the schema with `pnpm db:migrate` or `pnpm db:push`.
6. Seed sample places with `pnpm db:seed`.
7. Run the app with `pnpm dev`.

## Features

- Protected personal dashboard
- Save places with name, category, city, country, and coordinates
- Show only selected places on the map
- Auto-fit the map viewport to selected places across cities or countries
- Straight-line distance summary for selected places
- Optional place image upload to S3-compatible storage
- Sample places in Bangkok, Chiang Mai, and Taipei

## Notes

- Keep secrets only in `.env` and never commit them.
- The map requires a Google Maps JavaScript API key.
- If you do not configure object storage, the app still works without image uploads.
