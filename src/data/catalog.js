export const STATUS_OPTIONS = [
  { value: 'want-to-watch', label: 'Want to Watch' },
  { value: 'currently-watching', label: 'Currently Watching' },
  { value: 'watched', label: 'Watched' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'not-interested', label: 'Not Interested' },
]

export const MEDIA_TYPES = ['movie', 'tv', 'anime', 'documentary']

const rawSampleCatalog = [
  {
    id: 'dune-part-two',
    title: 'Dune: Part Two',
    originalTitle: 'Dune: Part Two',
    overview:
      'Paul Atreides unites with Chani and the Fremen to seek revenge against those who destroyed his family while racing to save Arrakis from apocalypse.',
    poster:
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    year: 2024,
    mediaType: 'movie',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    language: 'English',
    region: 'International',
    runtime: 166,
    externalRating: 8.6,
    originalLanguage: 'English',
    featured: true,
  },
  {
    id: 'spirited-away',
    title: 'Spirited Away',
    originalTitle: '千と千尋の神隠し',
    overview:
      'A young girl becomes trapped in a magical bathhouse and must find courage, friendship, and a way home.',
    poster:
      'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1600&q=80',
    year: 2001,
    mediaType: 'anime',
    genres: ['Fantasy', 'Adventure', 'Family'],
    language: 'Japanese',
    region: 'Japan',
    runtime: 125,
    externalRating: 8.6,
    originalLanguage: 'Japanese',
  },
  {
    id: 'shershaah',
    title: 'Shershaah',
    originalTitle: 'शेरशाह',
    overview:
      'A tribute to Captain Vikram Batra, whose bravery and sacrifice shaped a generation of soldiers and a nation.',
    poster:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80',
    year: 2021,
    mediaType: 'movie',
    genres: ['Action', 'Drama', 'War'],
    language: 'Hindi',
    region: 'India',
    runtime: 135,
    externalRating: 8.4,
    originalLanguage: 'Hindi',
  },
  {
    id: 'panchayat',
    title: 'Panchayat',
    originalTitle: 'पंचायत',
    overview:
      'An engineering graduate takes a rural post office job and learns the rhythms of village life, politics, and people.',
    poster:
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    year: 2020,
    mediaType: 'tv',
    genres: ['Comedy', 'Drama'],
    language: 'Hindi',
    region: 'India',
    seasons: 3,
    externalRating: 8.9,
    originalLanguage: 'Hindi',
  },
  {
    id: 'attack-on-titan',
    title: 'Attack on Titan',
    originalTitle: '進撃の巨人',
    overview:
      'Humans live behind towering walls while titans threaten their last remaining future and freedom.',
    poster:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
    year: 2013,
    mediaType: 'anime',
    genres: ['Action', 'Drama', 'Fantasy'],
    language: 'Japanese',
    region: 'Japan',
    seasons: 4,
    externalRating: 9.0,
    originalLanguage: 'Japanese',
  },
  {
    id: 'parasite',
    title: 'Parasite',
    originalTitle: '기생충',
    overview:
      'Two families navigate greed, class tension, and a sudden chain of events in a razor-sharp thriller.',
    poster:
      'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=800&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=80',
    year: 2019,
    mediaType: 'movie',
    genres: ['Thriller', 'Drama', 'Mystery'],
    language: 'Korean',
    region: 'South Korea',
    runtime: 132,
    externalRating: 8.5,
    originalLanguage: 'Korean',
  },
  {
    id: 'dark',
    title: 'Dark',
    originalTitle: 'Dark',
    overview:
      'In a small German town, a family begins to unravel a pattern of disappearances and time loops.',
    poster:
      'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=800&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=80',
    year: 2017,
    mediaType: 'tv',
    genres: ['Sci-Fi', 'Mystery', 'Thriller'],
    language: 'German',
    region: 'Germany',
    seasons: 3,
    externalRating: 8.7,
    originalLanguage: 'German',
  },
  {
    id: '3-idiots',
    title: '3 Idiots',
    originalTitle: '३ ईडियट्स',
    overview:
      'Three engineering students chase institutional pressure, friendship, and the meaning of success in a funny, moving story.',
    poster:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80',
    year: 2009,
    mediaType: 'movie',
    genres: ['Comedy', 'Drama'],
    language: 'Hindi',
    region: 'India',
    runtime: 170,
    externalRating: 8.4,
    originalLanguage: 'Hindi',
  },
  {
    id: 'the-family-man',
    title: 'The Family Man',
    originalTitle: 'The Family Man',
    overview:
      'A spy must balance a covert mission with the family life he never expected to build.',
    poster:
      'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=800&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&q=80',
    year: 2019,
    mediaType: 'tv',
    genres: ['Action', 'Drama', 'Thriller'],
    language: 'Hindi',
    region: 'India',
    seasons: 2,
    externalRating: 8.7,
    originalLanguage: 'Hindi',
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    originalTitle: 'Oppenheimer',
    overview:
      'The story of J. Robert Oppenheimer and the scientists who changed the world through a devastating invention.',
    poster:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    year: 2023,
    mediaType: 'movie',
    genres: ['Drama', 'History', 'Thriller'],
    language: 'English',
    region: 'International',
    runtime: 180,
    externalRating: 8.4,
    originalLanguage: 'English',
  },
  {
    id: 'made-in-heaven',
    title: 'Made in Heaven',
    originalTitle: 'Made in Heaven',
    overview:
      'A wedding planner and an architect grapple with class, love, and the rituals that define modern India.',
    poster:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80',
    year: 2019,
    mediaType: 'tv',
    genres: ['Drama', 'Romance'],
    language: 'Hindi',
    region: 'India',
    seasons: 2,
    externalRating: 8.6,
    originalLanguage: 'Hindi',
  },
  {
    id: 'your-name',
    title: 'Your Name',
    originalTitle: '君の名は。',
    overview:
      'Two teenagers begin to swap bodies and lives as a cosmic connection shifts their destinies.',
    poster:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=80',
    year: 2016,
    mediaType: 'anime',
    genres: ['Romance', 'Drama', 'Fantasy'],
    language: 'Japanese',
    region: 'Japan',
    runtime: 106,
    externalRating: 8.5,
    originalLanguage: 'Japanese',
  },
]

export const sampleCatalog = rawSampleCatalog.map((item) => ({
  ...item,
  source: 'sample',
  sourceId: item.id,
}))

export const defaultStates = {
  'dune-part-two': { status: 'want-to-watch', favourite: false, personalRating: 8, notes: 'Epic scope and visuals.' },
  'spirited-away': { status: 'watched', favourite: true, personalRating: 9, notes: 'Still one of my favorites.', dateWatched: '2024-05-14' },
  'panchayat': { status: 'currently-watching', favourite: false, personalRating: 7, notes: 'Comfort watch.' },
}
