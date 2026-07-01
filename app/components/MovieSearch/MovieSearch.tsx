'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Alert, Empty, Input, Pagination, Spin, Tabs } from 'antd';
import debounce from 'lodash/debounce';
import { GuestSessionResponse, Movie, MoviesResponse } from '@/app/lib/types';
import { MovieList } from '../MovieList/MovieList';
import styles from './MovieSearch.module.css';

const DEFAULT_QUERY = 'return';

function getInitialSearchParams() {
  if (typeof window === 'undefined') {
    return {
      query: DEFAULT_QUERY,
      inputValue: '',
      page: 1,
      tab: 'search',
    };
  }

  const params = new URLSearchParams(window.location.search);
  const queryFromUrl = params.get('query') || '';
  const pageFromUrl = Number(params.get('page')) || 1;
  const tabFromUrl = params.get('tab') || 'search';

  return {
    query: queryFromUrl || DEFAULT_QUERY,
    inputValue: queryFromUrl,
    page: pageFromUrl,
    tab: tabFromUrl,
  };
}

export function MovieSearch() {
  const router = useRouter();
  const pathname = usePathname();

  const initialParams = getInitialSearchParams();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [ratedMovies, setRatedMovies] = useState<Movie[]>([]);
  const [query, setQuery] = useState(initialParams.query);
  const [inputValue, setInputValue] = useState(initialParams.inputValue);
  const [page, setPage] = useState(initialParams.page);
  const [ratedPage, setRatedPage] = useState(initialParams.page);
  const [totalResults, setTotalResults] = useState(0);
  const [ratedTotalResults, setRatedTotalResults] = useState(0);
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const [activeTab, setActiveTab] = useState(initialParams.tab);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingLoadingIds, setRatingLoadingIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const ratingLoadingIdsRef = useRef<number[]>([]);

  const updateUrl = useCallback(
    (newQuery: string, newPage: number, newTab: string) => {
      const params = new URLSearchParams();

      if (newQuery && newQuery !== DEFAULT_QUERY) {
        params.set('query', newQuery);
      }

      if (newPage > 1) {
        params.set('page', String(newPage));
      }

      if (newTab !== 'search') {
        params.set('tab', newTab);
      }

      const queryString = params.toString();

      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [pathname, router],
  );

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        const newQuery = value.trim() || DEFAULT_QUERY;

        setIsLoading(true);
        setErrorMessage('');
        setQuery(newQuery);
        setPage(1);
        updateUrl(newQuery, 1, activeTab);
      }, 600),
    [activeTab, updateUrl],
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

        const moviesWithRatings = data.results.map((movie) => ({
          ...movie,
          rating: userRatings[movie.id] || movie.rating || 0,
        }));

        setMovies(moviesWithRatings);
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
  }, [query, page, activeTab, userRatings]);

  useEffect(() => {
    let isCurrent = true;

    async function loadRatedMovies() {
      const guestSessionId = localStorage.getItem('guestSessionId');

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

        const ratingsFromRated = data.results.reduce<Record<number, number>>(
          (acc, movie) => {
            if (movie.rating) {
              acc[movie.id] = movie.rating;
            }

            return acc;
          },
          {},
        );

        setUserRatings((currentRatings) => ({
          ...currentRatings,
          ...ratingsFromRated,
        }));
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
  }, [activeTab, ratedPage]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  async function getGuestSessionId() {
    const savedGuestSessionId = localStorage.getItem('guestSessionId');

    if (savedGuestSessionId) {
      return savedGuestSessionId;
    }

    const response = await fetch('/api/guest-session');

    if (!response.ok) {
      throw new Error('Failed to create guest session');
    }

    const data: GuestSessionResponse = await response.json();

    localStorage.setItem('guestSessionId', data.guest_session_id);

    return data.guest_session_id;
  }

  async function handleRate(movieId: number, rating: number) {
    if (ratingLoadingIdsRef.current.includes(movieId)) {
      return;
    }

    ratingLoadingIdsRef.current = [...ratingLoadingIdsRef.current, movieId];

    setRatingLoadingIds((currentIds) => {
      if (currentIds.includes(movieId)) {
        return currentIds;
      }

      return [...currentIds, movieId];
    });

    setErrorMessage('');

    try {
      const guestSessionId = await getGuestSessionId();

      const response = await fetch('/api/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId,
          rating,
          guestSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to rate movie');
      }

      setUserRatings((currentRatings) => ({
        ...currentRatings,
        [movieId]: rating,
      }));

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
      setErrorMessage('Failed to rate movie. Please try again.');
    } finally {
      ratingLoadingIdsRef.current = ratingLoadingIdsRef.current.filter(
        (id) => id !== movieId,
      );

      setRatingLoadingIds((currentIds) =>
        currentIds.filter((id) => id !== movieId),
      );
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
    updateUrl(query, newPage, activeTab);
  }

  function handleRatedPageChange(newPage: number) {
    setIsLoading(true);
    setErrorMessage('');
    setRatedPage(newPage);
    updateUrl(query, newPage, activeTab);
  }

  function handleTabChange(key: string) {
    setIsLoading(true);
    setErrorMessage('');
    setActiveTab(key);
    updateUrl(query, key === 'rated' ? ratedPage : page, key);
  }

  const searchContent = (
    <>
      <Input
        placeholder="Введите название фильма"
        value={inputValue}
        onChange={handleInputChange}
        className={styles.searchInput}
      />

      {!isLoading && !errorMessage && movies.length > 0 && (
        <>
          <div className={styles.results}>
            <MovieList
              movies={movies}
              onRate={handleRate}
              ratingLoadingIds={ratingLoadingIds}
            />
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
            <MovieList
              movies={ratedMovies}
              onRate={handleRate}
              ratingLoadingIds={ratingLoadingIds}
            />
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
