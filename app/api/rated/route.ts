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
  const guestSessionId = searchParams.get('guestSessionId');
  const page = searchParams.get('page') || '1';

  if (!guestSessionId) {
    return NextResponse.json(
      { error: 'guestSessionId is required' },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `${API_URL}/guest_session/${guestSessionId}/rated/movies?api_key=${apiKey}&language=en-US&page=${page}&sort_by=created_at.desc`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to load rated movies' },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load rated movies' },
      { status: 500 },
    );
  }
}
