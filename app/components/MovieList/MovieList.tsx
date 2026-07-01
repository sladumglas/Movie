import { Movie } from '@/app/lib/types';
import { MovieCard } from '../MovieCard/MovieCard';
import styles from './MovieList.module.css';

type MovieListProps = {
  movies: Movie[];
  onRate?: (movieId: number, rating: number) => void;
  ratingLoadingIds?: number[];
};

export function MovieList({
  movies,
  onRate,
  ratingLoadingIds = [],
}: MovieListProps) {
  return (
    <div className={styles.movieList}>
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onRate={onRate}
          isRatingLoading={ratingLoadingIds.includes(movie.id)}
        />
      ))}
    </div>
  );
}
