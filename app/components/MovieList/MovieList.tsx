import { Movie } from '@/app/lib/types';
import { MovieCard } from '../MovieCard/MovieCard';
import styles from './MovieList.module.css';

type MovieListProps = {
  movies: Movie[];
  onRate?: (movieId: number, rating: number) => void;
};

export function MovieList({ movies, onRate }: MovieListProps) {
  return (
    <div className={styles.movieList}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onRate={onRate} />
      ))}
    </div>
  );
}
