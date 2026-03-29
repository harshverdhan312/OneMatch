# OneMatch Backend MVP

Production-ready backend for the OneMatch premium dating platform.

## Features
- **Auth**: JWT-based auth with Refresh tokens.
- **Profile**: Multi-step onboarding with Spotify integration.
- **Match**: Advanced matching with "One active match" enforcement.
- **Chat**: Real-time messaging state management.
- **Check-in**: Automatic 24h and 1w check-ins.
- **Cron**: Automated match generation, check-ins, and 48h expiry.

## Setup
1. `npm install`
2. Create `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/onematch
   ACCESS_TOKEN_SECRET=your_access_secret
   REFRESH_TOKEN_SECRET=your_refresh_secret
   CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
   SPOTIFY_CLIENT_ID=your_id
   SPOTIFY_CLIENT_SECRET=your_secret
   ```
3. `npm start`

## API Endpoints

### Auth
- `POST /api/auth/register` - { email, password }
- `POST /api/auth/login` - { email, password }
- `POST /api/auth/refresh` - { refreshToken }
- `GET /api/auth/me` - (Auth Required)

### Profile
- `GET /api/profile` - Get current profile
- `PUT /api/profile/basic-info` - { name, gender, city, ... }
- `PUT /api/profile/preferences` - { genderPreference, ... }
- `PATCH /api/profile` - General update

### Match
- `GET /api/match/current` - Get active match
- `POST /api/match/:id/respond` - { action: 'accepted' | 'declined' }

### Chat
- `POST /api/chat/send` - { matchId, text }
- `GET /api/chat/:matchId` - Get messages

### Check-in
- `GET /api/checkin/pending` - Get pending check-in
- `POST /api/checkin/respond` - { matchId, type, response }
