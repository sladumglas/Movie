import { MoviesResponse } from './types';

const API_URL = 'https://api.themoviedb.org/3';

export async function getMovies(): Promise<MoviesResponse> {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    throw new Error('TMDB_API_KEY is missing');
  }

  try {
    const response = await fetch(
      `${API_URL}/search/movie?api_key=${apiKey}&query=return&language=en-US&page=1`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }

    return response.json();
  } catch {
    throw new Error(
      'Failed to load movies. Please check your internet connection.',
    );
  }
}
