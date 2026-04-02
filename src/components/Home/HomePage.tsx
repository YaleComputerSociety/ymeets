import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import screenshot from './ymeets-screenshot.png';
import Footer from '../utils/components/Footer';
import Button from '../utils/components/Button';

// Each slot: null = free, 'busy' = imported event, 'filled' = autofilled availability
const SLOTS = [
  { label: '10 AM', type: 'busy',  event: 'Team Standup' },
  { label: '11 AM', type: null,    event: null },
  { label: '12 PM', type: 'busy',  event: 'Lunch' },
  { label: '1 PM',  type: null,    event: null },
  { label: '2 PM',  type: 'busy',  event: 'Design Review' },
  { label: '3 PM',  type: null,    event: null },
] as const;

function AutofillDemo() {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    function cycle() {
      setFilled(false);
      t = setTimeout(() => {
        setFilled(true);
        t = setTimeout(cycle, 2500);
      }, 1000);
    }
    t = setTimeout(cycle, 500);
    return () => clearTimeout(t);
  }, []);

  const freeIndices = SLOTS.map((s, i) => s.type === null ? i : -1).filter(i => i >= 0);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 dark:bg-green-400 flex-shrink-0"></span>
          <span className="text-sm text-gray-600 dark:text-gray-300">Google Calendar</span>
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">Connected</span>
        </div>
        <button className="px-4 py-1.5 bg-primary text-white font-semibold rounded-full text-sm whitespace-nowrap">
          Autofill Availability
        </button>
      </div>
      <div className="flex gap-2">
        {/* Time labels */}
        <div className="flex flex-col gap-0.5 text-right">
          {SLOTS.map(s => (
            <div key={s.label} className="h-7 flex items-center justify-end">
              <span className="text-xs text-gray-400 dark:text-gray-500 w-10">{s.label}</span>
            </div>
          ))}
        </div>
        {/* Calendar column */}
        <div className="flex-1 flex flex-col gap-0.5">
          {SLOTS.map((slot, i) => {
            const isFree = slot.type === null;
            const isNowFilled = isFree && filled;
            const fillDelay = freeIndices.indexOf(i) * 80;
            const isDark = document.documentElement.classList.contains('dark');
            return (
              <div
                key={slot.label}
                className="h-7 rounded flex items-center px-2 text-xs font-medium transition-all duration-300"
                style={{
                  backgroundColor: slot.type === 'busy'
                    ? isDark ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.15)'
                    : isNowFilled
                      ? isDark ? 'rgba(59,130,246,0.55)' : 'rgba(59,130,246,0.35)'
                      : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                  transitionDelay: isNowFilled ? `${fillDelay}ms` : '0ms',
                  color: slot.type === 'busy'
                    ? isDark ? 'rgb(147,197,253)' : 'rgb(37,99,235)'
                    : isNowFilled
                      ? isDark ? 'rgb(191,219,254)' : 'rgb(29,78,216)'
                      : 'transparent',
                }}
              >
                {slot.event}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Feature 2: Response notifications
const NOTIF_ITEMS = [
  { name: 'Sarah', event: 'Team Dinner', time: 'just now' },
  { name: 'James', event: 'Weekend Hike', time: '4m ago' },
  { name: 'Arush', event: 'Project Sync', time: '11m ago' },
];

function NotificationsDemo() {
  const [topVisible, setTopVisible] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    function cycle() {
      setTopVisible(false);
      t = setTimeout(() => {
        setTopVisible(true);
        t = setTimeout(cycle, 3000);
      }, 1500);
    }
    t = setTimeout(cycle, 800);
    return () => clearTimeout(t);
  }, []);

  const newEmail = NOTIF_ITEMS[0];
  const existingEmails = NOTIF_ITEMS.slice(1);

  return (
    <div className="overflow-hidden">
      {/* New email slides in, expanding from 0 height */}
      <div
        style={{
          maxHeight: topVisible ? '120px' : '0px',
          opacity: topVisible ? 1 : 0,
          marginBottom: topVisible ? '16px' : '0px',
          transition: 'max-height 400ms ease, opacity 300ms ease, margin-bottom 400ms ease',
          overflow: 'hidden',
        }}
      >
        <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
          <div className="w-7 h-7 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-text dark:text-text-dark truncate">
                {newEmail.name} responded to {newEmail.event}
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{newEmail.time}</span>
            </div>
            <div className="text-xs text-primary dark:text-blue-400 mt-0.5 font-medium">
              View responses →
            </div>
          </div>
        </div>
      </div>
      {/* Existing emails always visible */}
      {existingEmails.map(({ name, event, time }) => (
        <div key={name} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-700 mb-4">
          <div className="w-7 h-7 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-text dark:text-text-dark truncate">
                {name} responded to {event}
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{time}</span>
            </div>
            <div className="text-xs text-primary dark:text-blue-400 mt-0.5 font-medium">
              View responses →
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/// Feature 3: Email invites animation
function EmailInvitesDemo() {
  const [inviteSent, setInviteSent] = useState(false);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    function cycle() {
      setInviteSent(false);
      setClicked(false);
      t = setTimeout(() => {
        setClicked(true);
        t = setTimeout(() => {
          setInviteSent(true);
          t = setTimeout(cycle, 3000);
        }, 1000);
      }, 2000);
    }
    t = setTimeout(cycle, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
          alex@yale.edu
        </div>
        <button
          className="px-3 py-2 text-white text-sm font-medium rounded-lg transition-all duration-150"
          style={{
            backgroundColor: clicked ? 'rgb(29,78,216)' : 'var(--color-primary, #5191F2)',
            transform: clicked ? 'scale(0.93)' : 'scale(1)',
            boxShadow: clicked ? 'inset 0 2px 4px rgba(0,0,0,0.25)' : 'none',
          }}
        >
          {clicked && !inviteSent ? 'Inviting...' : 'Invite'}
        </button>
      </div>
      <div className="space-y-2 overflow-hidden">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span>sam@yale.edu - Responded</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span>jordan@yale.edu - Responded</span>
        </div>
        {/* New invite slides in */}
        <div
          style={{
            maxHeight: inviteSent ? '40px' : '0px',
            opacity: inviteSent ? 1 : 0,
            transition: 'max-height 400ms ease, opacity 300ms ease',
            overflow: 'hidden',
          }}
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
            <span>alex@yale.edu</span>
            <span className="text-blue-400 dark:text-blue-400 font-medium">— email sent</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationVotingDemo() {
  const [bumped, setBumped] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    function cycle() {
      setBumped(false);
      t = setTimeout(() => {
        setBumped(true);
        t = setTimeout(cycle, 2500);
      }, 2000);
    }
    t = setTimeout(cycle, 1000);
    return () => clearTimeout(t);
  }, []);

  const bars = [
    { label: 'Tsai CITY', votes: bumped ? 5 : 4, width: bumped ? 100 : 80 },
    { label: 'Bass Library', votes: 3, width: 60 },
    { label: 'The Elm', votes: 1, width: 20 },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="space-y-5">
        {bars.map(({ label, votes, width }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-text dark:text-text-dark">{label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400" style={{ transition: 'all 300ms ease' }}>{votes} votes</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${width}%`, transition: 'width 400ms ease' }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Feature 5: Visual availability grid
const GRID_OPACITIES = [
  [0.2, 0.4, 0.8, 0.6, 0.3],
  [0.1, 0.6, 1.0, 0.8, 0.4],
  [0.3, 0.5, 0.9, 0.7, 0.2],
  [0.2, 0.3, 0.6, 0.4, 0.1],
];

function VisualAvailabilityDemo() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-5 gap-1">
        {GRID_OPACITIES.map((row, i) =>
          row.map((opacity, j) => (
            <div
              key={`${i}-${j}`}
              className="h-6 rounded"
              style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }}
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
  );
}

// Feature 6: Easy sharing — copy button cycle
function EasySharingDemo() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    function cycle() {
      setCopied(false);
      t = setTimeout(() => {
        setCopied(true);
        t = setTimeout(cycle, 1500);
      }, 2500);
    }
    t = setTimeout(cycle, 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 truncate">
          ymeets.com/dashboard/ABC123
        </div>
        <button
          className="px-4 py-2 text-white text-sm font-medium rounded-lg"
          style={{
            backgroundColor: copied ? 'rgb(22,163,74)' : '#5191F2',
            transition: 'background-color 300ms ease',
          }}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          No account required
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          Works on any device
        </span>
      </div>
    </div>
  );
}

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
              <AutofillDemo />
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
              <NotificationsDemo />
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
              <EmailInvitesDemo />
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
              <LocationVotingDemo />
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
              <VisualAvailabilityDemo />
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
              <EasySharingDemo />
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
