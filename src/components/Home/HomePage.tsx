import { useNavigate } from 'react-router-dom';
import screenshot from './ymeets-screenshot.png';
import Footer from '../utils/components/Footer';
import Button from '../utils/components/Button';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-background-dark">
      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center px-6 pt-8 md:pt-12">
        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-text dark:text-text-dark text-center tracking-tight leading-none">
          Scheduling<br />made simple
        </h1>

        {/* Subheadline */}
        <p className="mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-300 text-center max-w-lg">
          The easiest way to find when everyone&apos;s free
        </p>

        {/* Value Props */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 dark:bg-blue-900/50 text-primary dark:text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
            <span>Syncs with Google Calendar</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 dark:bg-blue-900/50 text-primary dark:text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
            <span>Get notified when others respond</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 dark:bg-blue-900/50 text-primary dark:text-blue-400 flex items-center justify-center text-xs font-bold">3</span>
            <span>See availability at a glance</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-8">
          <Button
            bgColor="primary"
            textColor="white"
            onClick={() => navigate('/dayselect')}
            rounded="lg"
          >
            Create event
          </Button>
        </div>

        {/* Screenshot */}
        <div className="mt-10 mb-12 w-full max-w-4xl px-4">
          <div className="rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <img
              src={screenshot}
              alt="ymeets interface showing group availability"
              className="w-full h-auto"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
