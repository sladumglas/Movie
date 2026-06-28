import Image from 'next/image';
import { format } from 'date-fns';
import { Card, Rate, Tag } from 'antd';
import { Movie } from '@/app/lib/types';
import { cutText } from '@/app/lib/utils';
import styles from './MovieCard.module.css';

type MovieCardProps = {
  movie: Movie;
};

const PLACEHOLDER_GENRES = ['Action', 'Drama'];

export function MovieCard({ movie }: MovieCardProps) {
  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
    : '/placeholder.png';

  const formattedDate = movie.release_date
    ? format(new Date(movie.release_date), 'MMMM d, yyyy')
    : 'Unknown date';

  return (
    <Card className={styles.card} styles={{ body: { padding: 0 } }}>
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

            <div className={styles.ratingCircle}>
              {movie.vote_average.toFixed(1)}
            </div>
          </div>

          <span className={styles.date}>{formattedDate}</span>

          <div className={styles.genres}>
            {PLACEHOLDER_GENRES.map((genre) => (
              <Tag key={genre}>{genre}</Tag>
            ))}
          </div>

          <p className={styles.description}>
            {cutText(movie.overview || 'No description', 160)}
          </p>

          <Rate
            allowHalf
            disabled
            count={10}
            value={movie.vote_average}
            className={styles.stars}
          />
        </div>
      </div>
    </Card>
  );
}
