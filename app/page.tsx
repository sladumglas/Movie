import { Alert, Tabs } from 'antd';
import { getMovies } from './lib/api';
import { MovieList } from './components/MovieList/MovieList';

export default async function Home() {
  const data = await getMovies();

  return (
    <main className="page">
      <div className="tabs">
        <Tabs
          defaultActiveKey="search"
          items={[
            {
              key: 'search',
              label: 'Search',
            },
            {
              key: 'rated',
              label: 'Rated',
            },
          ]}
        />
      </div>

      {data.results.length > 0 ? (
        <MovieList movies={data.results} />
      ) : (
        <Alert message="Movies not found" type="info" />
      )}
    </main>
  );
}
