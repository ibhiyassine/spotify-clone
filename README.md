# Spotify Clone

A full-featured Spotify clone built with Vue.js/Nuxt 3, featuring authentication with the Spotify API, media playback, playlist management, search functionality, and a responsive design.

![Spotify Clone](/assets/Spotify-clone.png)

## Features

- 🔐 **Authentication**: Secure login with Spotify accounts
- 🎵 **Media Player**: Play/pause, skip, volume control, and progress tracking
- 📋 **Playlists**: Create, view, edit, and delete playlists
- 🔍 **Search**: Find artists, tracks, albums, and playlists
- 👤 **User Profile**: View and manage your profile
- 💾 **State Management**: Powered by Pinia for efficient state handling

## AI Contribution

This project leveraged AI assistance in several areas:

- **Design & CSS**: AI helped create a responsive and visually appealing interface similar to Spotify's design
- **Pinia Integration**: AI-assisted implementation of state management using Pinia stores
- **Media Player**: AI guidance for building the custom media player component
- **Component Structure**: AI suggestions for optimal component organization and reusability

## Tech Stack

- **Frontend**: Vue.js 3 with Composition API & Nuxt 3
- **Styling**: Tailwind CSS with custom theme configuration
- **State Management**: Pinia
- **API**: Spotify Web API
- **Authentication**: OAuth 2.0

## Setup

### Prerequisites

- Node.js (v16+)
- Spotify Developer Account with registered application

### Environment Variables

Create a `.env` file with the following variables:

```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

1. Open your browser to `http://localhost:3000`
2. Log in with your Spotify account
3. Browse and search for music
4. Create and manage playlists
5. Enjoy the media player functionality

## Project Structure

- `components/`: Reusable Vue components
- `composables/`: Shared composable functions (useSpotify, useAuth, etc.)
- `pages/`: Application routes and views
- `stores/`: Pinia state management stores
- `assets/`: Static assets and global CSS
