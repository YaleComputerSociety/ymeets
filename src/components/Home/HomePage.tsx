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
          Scheduling
          <br />
          made simple
        </h1>

        {/* Subheadline */}
        <p className="mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-300 text-center max-w-lg">
          The easiest way to find when everyone&apos;s free
        </p>

        {/* Value Props */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 dark:bg-blue-900/50 text-primary dark:text-blue-400 flex items-center justify-center text-xs font-bold">
              1
            </span>
            <span>Syncs with Google Calendar</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 dark:bg-blue-900/50 text-primary dark:text-blue-400 flex items-center justify-center text-xs font-bold">
              2
            </span>
            <span>Get notified when others respond</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 dark:bg-blue-900/50 text-primary dark:text-blue-400 flex items-center justify-center text-xs font-bold">
              3
            </span>
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

        {/* Features Section */}
        <section className="w-full max-w-6xl px-4 py-16">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text dark:text-text-dark mb-4">
              Everything you need to schedule
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features that make finding the perfect meeting time
              effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1: Google Calendar Sync with 1-click autofill */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-text dark:text-text-dark mb-3">
                1-click availability
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Connect your Google Calendar to see when you&apos;re busy and
                autofill your availability with a single click.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-text dark:text-text-dark">
                    Google Calendar
                  </span>
                  <span className="ml-auto text-xs text-green-600 dark:text-green-400 font-medium">
                    Connected
                  </span>
                </div>
                <button className="w-full mt-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                  Autofill my availability
                </button>
              </div>
            </div>

            {/* Feature 2: Email Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-text dark:text-text-dark mb-3">
                Response notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Get notified instantly when someone adds their availability to
                your event. No more checking back.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text dark:text-text-dark">
                      New availability submitted: Team Dinner
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Sarah has submitted their availability for Team Dinner
                    </div>
                    <div className="text-xs text-primary dark:text-blue-400 mt-2 font-medium">
                      View responses →
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Email Invites */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-text dark:text-text-dark mb-3">
                Email invites
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Invite people directly from ymeets. They&apos;ll receive an
                email with a link to fill out their availability.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                    alex@yale.edu
                  </div>
                  <button className="px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                    Invite
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <span>sam@yale.edu - Responded</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg
                      className="w-4 h-4 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    <span>jordan@yale.edu - Pending</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: Location Voting */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-text dark:text-text-dark mb-3">
                Location voting
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Can&apos;t decide where to meet? Add location options and let
                everyone vote on their favorite spot.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-text dark:text-text-dark">
                          Tsai CITY
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          4 votes
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: '80%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-text dark:text-text-dark">
                          Bass Library
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          3 votes
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: '60%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-text dark:text-text-dark">
                          The Elm
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          1 vote
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: '20%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 5: Visual Availability */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-text dark:text-text-dark mb-3">
                Visual availability
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                See when everyone&apos;s free at a glance with our heat map
                visualization. Darker means more people available.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-5 gap-1">
                  {[
                    [0.2, 0.4, 0.8, 0.6, 0.3],
                    [0.1, 0.6, 1.0, 0.8, 0.4],
                    [0.3, 0.5, 0.9, 0.7, 0.2],
                    [0.2, 0.3, 0.6, 0.4, 0.1],
                  ].map((row, i) =>
                    row.map((opacity, j) => (
                      <div
                        key={`${i}-${j}`}
                        className="h-6 rounded"
                        style={{
                          backgroundColor: `rgba(59, 130, 246, ${opacity})`,
                        }}
                      ></div>
                    ))
                  )}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                </div>
              </div>
            </div>

            {/* Feature 6: Easy Sharing */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-text dark:text-text-dark mb-3">
                Easy sharing
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Share your ymeets with a simple link. No sign-up required for
                participants to respond.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 truncate">
                    ymeets.com/dashboard/ABC123
                  </div>
                  <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                    Copy
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    No account required
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    Works on any device
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom CTA */}
      <section className="w-full bg-background dark:bg-background-dark pt-0 pb-10 px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-text dark:text-text-dark mb-6">
          Ready to get started?
        </h2>
        <Button
          bgColor="primary"
          textColor="white"
          onClick={() => navigate('/dayselect')}
          rounded="lg"
        >
          Try it out today
        </Button>
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          ymeets is built and maintained by a small group of volunteers at the{' '}
          <a
            href="https://yalecomputersociety.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            Yale Computer Society
          </a>
          {' — '}
          <a
            href="/about"
            className="underline hover:text-primary transition-colors"
          >
            meet the team
          </a>
        </p>
      </section>

      <Footer />
    </div>
  );
}
