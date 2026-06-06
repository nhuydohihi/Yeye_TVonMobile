# LAB04 Homework - Android TV Movie App

This Expo Go project implements the Lab 4 homework: a TV-style Android movie application featuring a favorite movie, a professional movie dashboard, local watchlist storage, and optional TMDB API loading.

## Features

- Professional landscape "Movie Control Room" interface.
- Sidebar navigation inspired by Android TV apps.
- Featured movie spotlight with poster, metadata, overview, and actions.
- Horizontal movie shelf with remote-friendly cards.
- Detail panel with rating, year, runtime, genre, and overview.
- Watchlist/favorite persistence using AsyncStorage.
- Dashboard stats for movie count, watchlist count, and data source.
- Optional TMDB API key input to load real popular movies from TMDB.

## UI 
<img width="1792" height="828" alt="image" src="https://github.com/user-attachments/assets/fa5019a5-2b14-456e-b344-6b93020ca42a" />

<img width="1792" height="828" alt="image" src="https://github.com/user-attachments/assets/be05d03a-3bb6-42f3-a3ca-c3b0d2cecfed" />

## Run

```bash
npm install
npx expo start -c
```

Scan with Expo Go. Rotate the phone to landscape for the TV layout.

## Note

The original homework references native Android TV/Leanback APIs. Expo Go cannot run Leanback TV fragments directly, so this project provides a React Native TV-style implementation that demonstrates the required movie browsing experience and storage behavior.
