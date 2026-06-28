'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import { Rate, Tag } from 'antd';
import { Genre, Movie } from '@/app/lib/types';
import { cutText } from '@/app/lib/utils';
import { useGenres } from '../../context/GenresContext';
import styles from './MovieCard.module.css';

type MovieCardProps = {
  movie: Movie;
  onRate?: (movieId: number, rating: number) => void;
};

function getRatingColor(rating: number) {
  if (rating < 3) {
    return '#E90000';
  }

  if (rating < 5) {
    return '#E97E00';
  }

  if (rating < 7) {
    return '#E9D100';
  }

  return '#66E900';
}

export function MovieCard({ movie, onRate }: MovieCardProps) {
  const genres = useGenres();

  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
    : '/placeholder.png';

  const formattedDate = movie.release_date
    ? format(new Date(movie.release_date), 'MMMM d, yyyy')
    : 'Unknown date';

  const movieGenres = movie.genre_ids
    .map((genreId) => genres.find((genre) => genre.id === genreId))
    .filter((genre): genre is Genre => genre !== undefined);

  function handleRate(value: number) {
    if (onRate) {
      onRate(movie.id, value);
    }
  }

  return (
    <article className={styles.card}>
      <div className={styles.content}>
        <div className={styles.posterWrapper}>
          <Image
            src={imageUrl}
            alt={movie.title}
            width={183}
            height={281}
            className={styles.poster}
            loading="eager"
          />
        </div>

        <div className={styles.info}>
          <div className={styles.header}>
            <h2 className={styles.title}>{movie.title}</h2>

            <div
              className={styles.ratingCircle}
              style={{ borderColor: getRatingColor(movie.vote_average) }}
            >
              {movie.vote_average.toFixed(1)}
            </div>
          </div>

          <span className={styles.date}>{formattedDate}</span>

          <div className={styles.genres}>
            {movieGenres.map((genre) => (
              <Tag key={genre.id}>{genre.name}</Tag>
            ))}
          </div>

          <p className={styles.description}>
            {cutText(movie.overview || 'No description', 100)}
          </p>

          <Rate
            allowHalf
            count={10}
            value={movie.rating || 0}
            onChange={handleRate}
            className={styles.stars}
          />
        </div>
      </div>
    </article>
  );
}
