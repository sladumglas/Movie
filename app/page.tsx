import { MovieSearch } from './components/MovieSearch/MovieSearch';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="page">
      <MovieSearch />
    </main>
  );
}
