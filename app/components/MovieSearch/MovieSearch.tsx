'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Empty, Input, Pagination, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { Movie, MoviesResponse } from '@/app/lib/types';
import { MovieList } from '../MovieList/MovieList';
import styles from './MovieSearch.module.css';

const DEFAULT_QUERY = 'return';

export function MovieSearch() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [inputValue, setInputValue] = useState(DEFAULT_QUERY);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        const newQuery = value.trim() || DEFAULT_QUERY;

        setIsLoading(true);
        setErrorMessage('');
        setQuery(newQuery);
        setPage(1);
      }, 600),
    [],
  );

  useEffect(() => {
    let isCurrent = true;

    async function loadMovies() {
      try {
        const response = await fetch(
          `/api/movies?query=${encodeURIComponent(query)}&page=${page}`,
        );

        if (!response.ok) {
          throw new Error('Failed to load movies');
        }

        const data: MoviesResponse = await response.json();

        if (!isCurrent) {
          return;
        }

        setMovies(data.results);
        setTotalResults(data.total_results);
      } catch {
        if (!isCurrent) {
          return;
        }

        setMovies([]);
        setTotalResults(0);
        setErrorMessage(
          'Failed to load movies. Please check your internet connection.',
        );
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadMovies();

    return () => {
      isCurrent = false;
    };
  }, [query, page]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    setInputValue(value);
    debouncedSearch(value);
  }

  function handlePageChange(newPage: number) {
    setIsLoading(true);
    setErrorMessage('');
    setPage(newPage);
  }

  return (
    <>
      <Input
        placeholder="Type to search..."
        value={inputValue}
        onChange={handleInputChange}
        className={styles.searchInput}
      />

      {errorMessage && (
        <Alert
          title="Something went wrong"
          description={errorMessage}
          type="error"
          showIcon
          className={styles.alert}
        />
      )}

      {isLoading && (
        <div className={styles.loader}>
          <Spin size="large" percent="auto" />
        </div>
      )}

      {!isLoading && !errorMessage && movies.length > 0 && (
        <>
          <div className={styles.results}>
            <MovieList movies={movies} />
          </div>

          <div className={styles.pagination}>
            <Pagination
              current={page}
              total={totalResults}
              pageSize={20}
              showSizeChanger={false}
              onChange={handlePageChange}
            />
          </div>
        </>
      )}

      {!isLoading && !errorMessage && movies.length === 0 && (
        <Empty description="No movies found" />
      )}
    </>
  );
}
