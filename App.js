import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const STORAGE_KEY = 'lab04-tv-movie-state-v1';
const imageBase = 'https://image.tmdb.org/t/p/w780';
const posterBase = 'https://image.tmdb.org/t/p/w500';

const fallbackMovies = [
  {
    id: 157336,
    title: 'Interstellar',
    year: '2014',
    runtime: '2h 49m',
    rating: 8.7,
    genre: 'Sci-Fi Adventure',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
    overview: 'A team of explorers travels through a wormhole in space in an attempt to ensure humanity survival.'
  },
  {
    id: 27205,
    title: 'Inception',
    year: '2010',
    runtime: '2h 28m',
    rating: 8.4,
    genre: 'Action Thriller',
    poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.'
  },
  {
    id: 603,
    title: 'The Matrix',
    year: '1999',
    runtime: '2h 16m',
    rating: 8.2,
    genre: 'Cyberpunk Action',
    poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
    overview: 'A computer hacker learns that reality is a simulation and joins a rebellion against its controllers.'
  },
  {
    id: 155,
    title: 'The Dark Knight',
    year: '2008',
    runtime: '2h 32m',
    rating: 8.5,
    genre: 'Crime Drama',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg',
    overview: 'Batman faces the Joker, a criminal mastermind who pushes Gotham into chaos.'
  },
  {
    id: 496243,
    title: 'Parasite',
    year: '2019',
    runtime: '2h 12m',
    rating: 8.5,
    genre: 'Drama Thriller',
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',
    overview: 'A poor family schemes to become employed by a wealthy household, leading to unexpected consequences.'
  },
  {
    id: 324857,
    title: 'Spider-Man: Into the Spider-Verse',
    year: '2018',
    runtime: '1h 57m',
    rating: 8.4,
    genre: 'Animated Hero',
    poster: 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/7d6EY00g1c39SGZOoCJ5Py9nNth.jpg',
    overview: 'Miles Morales becomes Spider-Man and joins other Spider-heroes from across the multiverse.'
  }
];

function normalizeTmdbMovie(movie) {
  const date = movie.release_date || '';
  return {
    id: movie.id,
    title: movie.title || movie.name || 'Untitled',
    year: date ? date.slice(0, 4) : 'N/A',
    runtime: 'TMDB',
    rating: Number(movie.vote_average || 0).toFixed(1),
    genre: 'Movie',
    poster: movie.poster_path ? `${posterBase}${movie.poster_path}` : fallbackMovies[0].poster,
    backdrop: movie.backdrop_path ? `${imageBase}${movie.backdrop_path}` : fallbackMovies[0].backdrop,
    overview: movie.overview || 'No overview available from TMDB.'
  };
}

export default function App() {
  const [movies, setMovies] = useState(fallbackMovies);
  const [selectedId, setSelectedId] = useState(fallbackMovies[0].id);
  const [watchlist, setWatchlist] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sourceLabel, setSourceLabel] = useState('Curated offline movie shelf');

  const selectedMovie = useMemo(
    () => movies.find((movie) => movie.id === selectedId) || movies[0],
    [movies, selectedId]
  );
  const watchlistMovies = useMemo(
    () => movies.filter((movie) => watchlist.includes(movie.id)),
    [movies, watchlist]
  );

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      const saved = JSON.parse(raw);
      setApiKey(saved.apiKey || '');
      setWatchlist(saved.watchlist || []);
      if (saved.selectedId) setSelectedId(saved.selectedId);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ apiKey, watchlist, selectedId }));
  }, [apiKey, watchlist, selectedId]);

  const toggleWatchlist = () => {
    setWatchlist((current) => (
      current.includes(selectedMovie.id)
        ? current.filter((id) => id !== selectedMovie.id)
        : [selectedMovie.id, ...current]
    ));
  };

  const loadTmdb = async () => {
    if (!apiKey.trim()) {
      Alert.alert('TMDB API key needed', 'Paste your TMDB API key first, or continue using the curated movie shelf.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey.trim()}&language=en-US&page=1`);
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.results)) {
        throw new Error(data.status_message || 'TMDB request failed');
      }
      const nextMovies = data.results.slice(0, 12).map(normalizeTmdbMovie);
      setMovies(nextMovies);
      setSelectedId(nextMovies[0].id);
      setSourceLabel('Loaded from TMDB popular movies');
    } catch (error) {
      Alert.alert('Could not load TMDB', 'Please check your API key and internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetShelf = () => {
    setMovies(fallbackMovies);
    setSelectedId(fallbackMovies[0].id);
    setSourceLabel('Curated offline movie shelf');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
        <View style={styles.shell}>
          <View style={styles.sideRail}>
            <Text style={styles.railLogo}>TV</Text>
            <Text style={styles.railItem}>Home</Text>
            <Text style={styles.railItem}>Movies</Text>
            <Text style={styles.railItem}>List</Text>
            <Text style={styles.railFooter}>LAB04</Text>
          </View>

          <View style={styles.mainArea}>
            <View style={styles.topBar}>
              <View>
                <Text style={styles.brand}>Android TV Homework</Text>
                <Text style={styles.nav}>Movie Control Room</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{sourceLabel}</Text>
              </View>
            </View>

            <View style={styles.spotlight}>
              <View style={styles.posterShell}>
                <Image source={{ uri: selectedMovie.poster }} style={styles.featurePoster} />
              </View>

              <View style={styles.detailPanel}>
                <Text style={styles.eyebrow}>Featured Selection</Text>
                <Text style={styles.title} numberOfLines={2}>{selectedMovie.title}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaChip}>{selectedMovie.year}</Text>
                  <Text style={styles.metaChip}>{selectedMovie.runtime}</Text>
                  <Text style={styles.metaChip}>Rating {selectedMovie.rating}</Text>
                </View>
                <Text style={styles.genre}>{selectedMovie.genre}</Text>
                <Text style={styles.overview} numberOfLines={4}>{selectedMovie.overview}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.playButton}>
                    <Text style={styles.playText}>Watch Preview</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.watchButton} onPress={toggleWatchlist}>
                    <Text style={styles.watchText}>{watchlist.includes(selectedMovie.id) ? 'Remove Watchlist' : 'Add Watchlist'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.apiPanel}>
              <View style={styles.apiCopy}>
                <Text style={styles.panelTitle}>TMDB Data Console</Text>
                <Text style={styles.panelText}>Load popular movies from The Movie Database, or keep the curated offline shelf for demo.</Text>
              </View>
              <TextInput
                style={styles.input}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="TMDB API key"
                placeholderTextColor="#77849a"
                secureTextEntry
              />
              <TouchableOpacity style={styles.loadButton} onPress={loadTmdb}>
                {isLoading ? <ActivityIndicator color="#050814" /> : <Text style={styles.loadText}>Load Movies</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.resetButton} onPress={resetShelf}>
                <Text style={styles.resetText}>Offline Shelf</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsStrip}>
              <Stat label="Movies" value={movies.length} />
              <Stat label="Watchlist" value={watchlist.length} />
              <Stat label="Source" value={sourceLabel.includes('TMDB') ? 'TMDB' : 'Offline'} />
            </View>
          </View>
        </View>

        <View style={styles.rows}>
          <MovieRow title="Movie Shelf" movies={movies} selectedId={selectedId} onSelect={setSelectedId} />
          <MovieRow title="My Watchlist" movies={watchlistMovies} selectedId={selectedId} onSelect={setSelectedId} emptyText="Add movies to your watchlist from the control room." />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MovieRow({ title, movies, selectedId, onSelect, emptyText }) {
  return (
    <View style={styles.rowBlock}>
      <Text style={styles.rowTitle}>{title}</Text>
      {movies.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
          {movies.map((movie) => (
            <TouchableOpacity
              key={movie.id}
              activeOpacity={0.82}
              style={[styles.card, selectedId === movie.id && styles.cardSelected]}
              onPress={() => onSelect(movie.id)}
            >
              <ImageBackground source={{ uri: movie.backdrop || movie.poster }} resizeMode="cover" style={styles.poster}>
                <View style={styles.posterShade}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{movie.title}</Text>
                  <Text style={styles.cardMeta}>{movie.year} | Rating {movie.rating}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.empty}>{emptyText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b0d12' },
  page: { flex: 1, backgroundColor: '#0b0d12' },
  pageContent: { paddingBottom: 26 },
  shell: { flexDirection: 'row', padding: 18, gap: 16 },
  sideRail: { width: 86, borderRadius: 8, backgroundColor: '#14171f', borderWidth: 1, borderColor: '#262b36', padding: 12, alignItems: 'center' },
  railLogo: { color: '#ffffff', fontSize: 24, fontWeight: '900', marginBottom: 18 },
  railItem: { color: '#aab3c2', fontSize: 12, fontWeight: '900', marginVertical: 9 },
  railFooter: { color: '#f4c95d', fontSize: 12, fontWeight: '900', marginTop: 'auto' },
  mainArea: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { color: '#f4c95d', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  nav: { color: '#ffffff', fontSize: 24, fontWeight: '900', marginTop: 2 },
  badge: { backgroundColor: '#1d2430', borderRadius: 8, paddingHorizontal: 12, minHeight: 34, justifyContent: 'center', maxWidth: 230, borderWidth: 1, borderColor: '#303847' },
  badgeText: { color: '#cbd5e1', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  spotlight: { flexDirection: 'row', gap: 18, marginTop: 16 },
  posterShell: { width: 174, height: 250, borderRadius: 8, overflow: 'hidden', backgroundColor: '#171b24', borderWidth: 1, borderColor: '#343b4a' },
  featurePoster: { width: '100%', height: '100%' },
  detailPanel: { flex: 1, minHeight: 250, borderRadius: 8, backgroundColor: '#111722', borderWidth: 1, borderColor: '#283142', padding: 18 },
  eyebrow: { color: '#f4c95d', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: '#ffffff', fontSize: 36, fontWeight: '900', marginTop: 8 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  metaChip: { color: '#dbe3ee', fontSize: 12, fontWeight: '900', backgroundColor: '#1f2937', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  genre: { color: '#7dd3fc', fontSize: 14, fontWeight: '900', marginTop: 12 },
  overview: { color: '#c6d0dd', fontSize: 14, lineHeight: 20, marginTop: 8, maxWidth: 690 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  playButton: { backgroundColor: '#f4c95d', borderRadius: 8, minHeight: 42, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  playText: { color: '#111318', fontSize: 15, fontWeight: '900' },
  watchButton: { borderWidth: 1, borderColor: '#485366', borderRadius: 8, minHeight: 42, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  watchText: { color: '#ffffff', fontSize: 14, fontWeight: '900' },
  apiPanel: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#14171f', borderRadius: 8, borderWidth: 1, borderColor: '#262b36', padding: 12, marginTop: 14 },
  apiCopy: { flex: 1 },
  panelTitle: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
  panelText: { color: '#9faabd', fontSize: 12, lineHeight: 16, marginTop: 4 },
  input: { width: 190, minHeight: 40, borderRadius: 8, borderWidth: 1, borderColor: '#3a4352', color: '#ffffff', paddingHorizontal: 11 },
  loadButton: { minHeight: 40, borderRadius: 8, backgroundColor: '#f4c95d', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  loadText: { color: '#111318', fontWeight: '900' },
  resetButton: { minHeight: 40, borderRadius: 8, borderWidth: 1, borderColor: '#3a4352', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  resetText: { color: '#d7e4f5', fontWeight: '900', fontSize: 12 },
  statsStrip: { flexDirection: 'row', gap: 10, marginTop: 12 },
  statCard: { flex: 1, backgroundColor: '#111722', borderRadius: 8, borderWidth: 1, borderColor: '#283142', padding: 12 },
  statValue: { color: '#ffffff', fontSize: 20, fontWeight: '900' },
  statLabel: { color: '#9faabd', fontSize: 12, fontWeight: '800', marginTop: 4 },
  rows: { paddingTop: 4 },
  rowBlock: { marginBottom: 22 },
  rowTitle: { color: '#ffffff', fontSize: 20, fontWeight: '900', marginLeft: 18, marginBottom: 10 },
  cardRow: { paddingHorizontal: 18, gap: 12, paddingBottom: 8 },
  card: { width: 154, height: 96, borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', backgroundColor: '#111827' },
  cardSelected: { borderColor: '#f4c95d', transform: [{ scale: 1.03 }] },
  poster: { flex: 1, justifyContent: 'flex-end' },
  posterShade: { minHeight: 48, backgroundColor: 'rgba(9, 12, 18, 0.76)', padding: 8, justifyContent: 'flex-end' },
  cardTitle: { color: '#ffffff', fontSize: 12, fontWeight: '900' },
  cardMeta: { color: '#cbd5e1', fontSize: 11, fontWeight: '800', marginTop: 3 },
  empty: { color: '#9aa8bc', fontSize: 14, marginLeft: 18 }
});
