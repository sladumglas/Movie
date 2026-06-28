'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Empty, Input, Pagination, Spin, Tabs } from 'antd';
import debounce from 'lodash/debounce';
import { Movie, MoviesResponse } from '@/app/lib/types';
import { MovieList } from '../MovieList/MovieList';
import styles from './MovieSearch.module.css';

const DEFAULT_QUERY = 'return';

export function MovieSearch() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [ratedMovies, setRatedMovies] = useState<Movie[]>([]);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [inputValue, setInputValue] = useState(DEFAULT_QUERY);
  const [page, setPage] = useState(1);
  const [ratedPage, setRatedPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [ratedTotalResults, setRatedTotalResults] = useState(0);
  const [activeTab, setActiveTab] = useState('search');
  const [guestSessionId] = useState(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    return localStorage.getItem('guestSessionId') || '';
  });
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

    if (activeTab === 'search') {
      loadMovies();
    }

    return () => {
      isCurrent = false;
    };
  }, [query, page, activeTab]);

  useEffect(() => {
    let isCurrent = true;

    async function loadRatedMovies() {
      if (!guestSessionId) {
        setRatedMovies([]);
        setRatedTotalResults(0);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/rated?guestSessionId=${guestSessionId}&page=${ratedPage}`,
        );

        if (!response.ok) {
          throw new Error('Failed to load rated movies');
        }

        const data: MoviesResponse = await response.json();

        if (!isCurrent) {
          return;
        }

        setRatedMovies(data.results);
        setRatedTotalResults(data.total_results);
      } catch {
        if (!isCurrent) {
          return;
        }

        setRatedMovies([]);
        setRatedTotalResults(0);
        setErrorMessage('Failed to load rated movies.');
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    if (activeTab === 'rated') {
      loadRatedMovies();
    }

    return () => {
      isCurrent = false;
    };
  }, [activeTab, ratedPage, guestSessionId]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  async function handleRate(movieId: number, rating: number) {
    const currentGuestSessionId =
      guestSessionId || localStorage.getItem('guestSessionId') || '';

    if (!currentGuestSessionId) {
      setErrorMessage('Guest session is not ready yet. Try again later.');
      return;
    }

    try {
      const response = await fetch('/api/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId,
          rating,
          guestSessionId: currentGuestSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to rate movie');
      }

      setMovies((currentMovies) =>
        currentMovies.map((movie) =>
          movie.id === movieId ? { ...movie, rating } : movie,
        ),
      );

      setRatedMovies((currentMovies) =>
        currentMovies.map((movie) =>
          movie.id === movieId ? { ...movie, rating } : movie,
        ),
      );
    } catch {
      setErrorMessage('Failed to rate movie.');
    }
  }

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

  function handleRatedPageChange(newPage: number) {
    setIsLoading(true);
    setErrorMessage('');
    setRatedPage(newPage);
  }

  function handleTabChange(key: string) {
    setIsLoading(true);
    setErrorMessage('');
    setActiveTab(key);
  }

  const searchContent = (
    <>
      <Input
        placeholder="Type to search..."
        value={inputValue}
        onChange={handleInputChange}
        className={styles.searchInput}
      />

      {!isLoading && !errorMessage && movies.length > 0 && (
        <>
          <div className={styles.results}>
            <MovieList movies={movies} onRate={handleRate} />
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

  const ratedContent = (
    <>
      {!isLoading && !errorMessage && ratedMovies.length > 0 && (
        <>
          <div className={styles.results}>
            <MovieList movies={ratedMovies} onRate={handleRate} />
          </div>

          <div className={styles.pagination}>
            <Pagination
              current={ratedPage}
              total={ratedTotalResults}
              pageSize={20}
              showSizeChanger={false}
              onChange={handleRatedPageChange}
            />
          </div>
        </>
      )}

      {!isLoading && !errorMessage && ratedMovies.length === 0 && (
        <Empty description="No rated movies yet" />
      )}
    </>
  );

  return (
    <>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        centered
        items={[
          {
            key: 'search',
            label: 'Search',
            children: searchContent,
          },
          {
            key: 'rated',
            label: 'Rated',
            children: ratedContent,
          },
        ]}
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
    </>
  );
}
