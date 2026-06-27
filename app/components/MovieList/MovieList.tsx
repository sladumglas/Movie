import { Movie } from '@/app/lib/types';
import { MovieCard } from '../MovieCard/MovieCard';
import styles from './MovieList.module.css';

type MovieListProps = {
  movies: Movie[];
};

export function MovieList({ movies }: MovieListProps) {
  return (
    <div className={styles.movieList}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
