import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://api.themoviedb.org/3';

export async function GET(request: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'TMDB_API_KEY is missing' },
      { status: 500 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || 'return';
  const page = searchParams.get('page') || '1';

  try {
    const response = await fetch(
      `${API_URL}/search/movie?api_key=${apiKey}&query=${query}&language=en-US&page=${page}`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch movies' },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        error: 'Failed to load movies. Please check your internet connection.',
      },
      { status: 500 },
    );
  }
}
