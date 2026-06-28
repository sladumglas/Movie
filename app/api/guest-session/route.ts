import { NextResponse } from 'next/server';
import { GuestSessionResponse } from '@/app/lib/types';

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
      `${API_URL}/authentication/guest_session/new?api_key=${apiKey}`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create guest session' },
        { status: response.status },
      );
    }

    const data: GuestSessionResponse = await response.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to create guest session' },
      { status: 500 },
    );
  }
}
