import { Tabs } from 'antd';
import { MovieSearch } from './components/MovieSearch/MovieSearch';

export const dynamic = 'force-dynamic';

export default function Home() {
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

      <MovieSearch />
    </main>
  );
}
