'use client';

import { useEffect, useState } from 'react';
import { GenresProvider } from '../../context/GenresContext';
import { Genre, GenresResponse, GuestSessionResponse } from '@/app/lib/types';

type AppProviderProps = {
  children: React.ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    async function initApp() {
      try {
        const savedGuestSessionId = localStorage.getItem('guestSessionId');

        if (!savedGuestSessionId) {
          const guestResponse = await fetch('/api/guest-session');
          const guestData: GuestSessionResponse = await guestResponse.json();

          if (guestData.guest_session_id) {
            localStorage.setItem('guestSessionId', guestData.guest_session_id);
          }
        }

        const genresResponse = await fetch('/api/genres');
        const genresData: GenresResponse = await genresResponse.json();

        setGenres(genresData.genres || []);
      } catch {
        setGenres([]);
      }
    }

    initApp();
  }, []);

  return <GenresProvider genres={genres}>{children}</GenresProvider>;
}
