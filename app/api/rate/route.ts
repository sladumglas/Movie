import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://api.themoviedb.org/3';

export async function POST(request: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'TMDB_API_KEY is missing' },
      { status: 500 },
    );
  }

  const body = await request.json();
  const movieId = body.movieId;
  const rating = body.rating;
  const guestSessionId = body.guestSessionId;

  if (!movieId || !rating || !guestSessionId) {
    return NextResponse.json(
      { error: 'movieId, rating and guestSessionId are required' },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `${API_URL}/movie/${movieId}/rating?api_key=${apiKey}&guest_session_id=${guestSessionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
          value: rating,
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to rate movie' },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to rate movie' },
      { status: 500 },
    );
  }
}
