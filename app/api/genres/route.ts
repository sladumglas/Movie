import { NextResponse } from 'next/server';

const API_URL = 'https://api.themoviedb.org/3';

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'TMDB_API_KEY is missing' },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `${API_URL}/genre/movie/list?api_key=${apiKey}&language=en-US`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to load genres' },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load genres' },
      { status: 500 },
    );
  }
}
