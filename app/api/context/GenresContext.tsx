'use client';

import { createContext, useContext } from 'react';
import { Genre } from '@/app/lib/types';

const GenresContext = createContext<Genre[]>([]);

type GenresProviderProps = {
  genres: Genre[];
  children: React.ReactNode;
};

export function GenresProvider({ genres, children }: GenresProviderProps) {
  return (
    <GenresContext.Provider value={genres}>{children}</GenresContext.Provider>
  );
}

export function useGenres() {
  return useContext(GenresContext);
}
