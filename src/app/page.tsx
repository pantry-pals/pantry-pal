import Hero from '@/components/landing/Hero';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pantry Pals',
  description: 'Manage your pantry, reduce food waste, and cook smarter.',
  icons: '/favicon.ico',
};

/** The Home page. */
const Home = () => (
  <main>
    <Hero />
  </main>
);

export default Home;
