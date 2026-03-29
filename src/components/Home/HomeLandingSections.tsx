import * as React from 'react';
import {
  IconBrandGoogle,
  IconCalendarEvent,
  IconLock,
  IconMapPin,
  IconMapPinFilled,
  IconUsers,
} from '@tabler/icons-react';
import Button from '../utils/components/Button';
import imgHeroCalendar from '../utils/components/TutorialModal/DaySelect-dark.png';
import heroVidCreate from '../utils/components/TutorialModal/ymeets-create-event-vid.mp4';
import heroVidShare from '../utils/components/TutorialModal/ymeets-copy-link-vid.mp4';
import heroVidImport from '../utils/components/TutorialModal/ymeets-import-cals-and-autofill-avails.mp4';
import heroVidSchedule from '../utils/components/TutorialModal/ymeets-view-availabilities.mp4';
import imgHowItWorksStep3 from './assets/how-it-works-step-3.png';
import gcalLogo from '../SideBySideView/gcal-logo.png';

type NavigateFn = (path: string) => void;

const sectionShell = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8';

const heroTutorialClips: {
  src: string;
  chromeTitle: string;
  videoAlt: string;
}[] = [
  {
    src: heroVidCreate,
    chromeTitle: 'ymeets — New event',
    videoAlt: 'Screen recording: creating an event in ymeets',
  },
  {
    src: heroVidShare,
    chromeTitle: 'ymeets — Share invite',
    videoAlt: 'Screen recording: sharing an event link',
  },
  {
    src: heroVidImport,
    chromeTitle: 'ymeets — Calendar sync',
    videoAlt: 'Screen recording: importing Google Calendar in ymeets',
  },
  {
    src: heroVidSchedule,
    chromeTitle: 'ymeets — Availability',
    videoAlt: 'Screen recording: viewing group availability',
  },
];

export function LandingHero({
  navigate,
  onOpenTutorial,
}: {
  navigate: NavigateFn;
  onOpenTutorial: () => void;
}) {
  const [heroClipIndex, setHeroClipIndex] = React.useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const clip = heroTutorialClips[heroClipIndex];

  return (
    <section className={`${sectionShell} pt-2 pb-16 md:pb-24`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
          <h1 className="text-text dark:text-text-dark font-bold text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl leading-tight tracking-tight">
            A cleaner, faster way to schedule meetings on Yale&apos;s campus.
          </h1>
          <ul className="flex flex-col gap-3 sm:gap-4 text-text dark:text-text-dark text-base sm:text-lg max-w-xl mx-auto lg:mx-0 text-left list-none pl-0">
            <li className="flex flex-row gap-3 items-start">
              <IconBrandGoogle
                className="shrink-0 mt-0.5 opacity-90"
                size={22}
                stroke={1.5}
              />
              <span>GCal integration</span>
            </li>
            <li className="flex flex-row gap-3 items-start">
              <IconMapPinFilled
                className="shrink-0 mt-0.5 opacity-90"
                size={22}
                stroke={1.5}
              />
              <span>
                <span className="hidden sm:inline">
                  Vote on a preferred campus meeting place
                </span>
                <span className="sm:hidden">
                  Vote on a preferred meeting place
                </span>
              </span>
            </li>
            <li className="flex flex-row gap-3 items-start">
              <IconLock
                className="shrink-0 mt-0.5 opacity-90"
                size={22}
                stroke={1.5}
              />
              <span>
                Lock in the best time and place to gather with a selection
              </span>
            </li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-2">
            <Button
              bgColor="primary"
              textColor="white"
              onClick={() => navigate('/dayselect')}
              className="!px-10 !py-4 !text-lg"
            >
              Create Event
            </Button>
          </div>
          <p className="text-sm text-text/70 dark:text-text-dark/70">
            <span className="font-semibold text-text dark:text-text-dark">
              New to ymeets?
            </span>{' '}
            <button
              type="button"
              className="underline underline-offset-2 hover:text-primary dark:hover:text-primary-dark transition text-left"
              onClick={onOpenTutorial}
            >
              Take a quick walkthrough
            </button>
          </p>
        </div>

        <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg">
            <div
              className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/40 via-primary/20 to-transparent dark:from-primary/30 dark:via-secondary/20 blur-sm opacity-90"
              aria-hidden
            />
            <div className="relative rounded-2xl border border-outline/30 dark:border-gray-600/80 bg-secondary_background dark:bg-secondary_background-dark shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-outline/20 dark:border-gray-600/60 bg-black/[0.02] dark:bg-white/[0.03]">
                <span className="flex gap-1.5" aria-hidden>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </span>
                <span className="text-xs font-medium text-text/60 dark:text-text-dark/60 truncate flex-1 text-center pr-8">
                  {clip.chromeTitle}
                </span>
              </div>
              <div className="relative w-full aspect-video bg-black/[0.04] dark:bg-black/40">
                {prefersReducedMotion ? (
                  <img
                    src={imgHeroCalendar}
                    alt="ymeets calendar: pick days and times for your event"
                    className="block w-full h-full object-cover object-top"
                  />
                ) : (
                  <video
                    key={clip.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="block w-full h-full object-cover object-top"
                    aria-label={clip.videoAlt}
                  >
                    <source src={clip.src} type="video/mp4" />
                  </video>
                )}
              </div>
              {!prefersReducedMotion && (
                <div className="flex items-center justify-between gap-3 px-3 py-2.5 border-t border-outline/20 dark:border-gray-600/60 bg-black/[0.02] dark:bg-white/[0.03]">
                  <p
                    className="text-xs font-medium text-text/70 dark:text-text-dark/70 min-w-0 truncate tabular-nums"
                    aria-live="polite"
                  >
                    Quick walkthrough{' '}
                    <span className="text-text/50 dark:text-text-dark/50">
                      •
                    </span>{' '}
                    {heroClipIndex + 1} of {heroTutorialClips.length}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    {heroTutorialClips.map((_, index) => {
                      const isCurrent = index === heroClipIndex;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setHeroClipIndex(index)}
                          className="relative p-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark"
                          aria-label={`Show tutorial clip ${index + 1} of ${heroTutorialClips.length}`}
                          aria-current={isCurrent ? 'true' : undefined}
                        >
                          {isCurrent && (
                            <span
                              className="absolute inset-0 bg-primary/20 dark:bg-primary-dark/20 rounded-full blur-[3px] scale-[1.8]"
                              aria-hidden
                            />
                          )}
                          <span
                            className={`relative block w-2 h-2 rounded-full transition-all duration-300 ease-out ${
                              isCurrent
                                ? 'bg-primary dark:bg-primary-dark'
                                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const featureCardBase =
  'rounded-2xl border border-outline/25 dark:border-gray-600/70 bg-secondary_background dark:bg-secondary_background-dark p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300';

export function LandingFeatureHighlights() {
  const items = [
    {
      icon: IconBrandGoogle,
      title: 'Google Calendar sync',
      body: 'Auto-fill availability from Google Calendar to save time.',
    },
    {
      icon: IconUsers,
      title: 'Group scheduling',
      body: 'Compare times across your group without endless messages.',
    },
    {
      icon: IconMapPin,
      title: 'Campus place voting',
      body: 'Let everyone vote on the best place to meet on campus.',
    },
  ];

  return (
    <section
      className={`${sectionShell} py-16 md:py-20 border-t border-outline/20 dark:border-gray-600/40`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {items.map(({ icon: Icon, title, body }) => (
          <div key={title} className={featureCardBase}>
            <div className="w-11 h-11 rounded-xl bg-primary/15 dark:bg-primary/25 flex items-center justify-center mb-4 text-primary dark:text-primary-dark">
              <Icon size={24} stroke={1.6} />
            </div>
            <h3 className="font-semibold text-lg text-text dark:text-text-dark mb-2">
              {title}
            </h3>
            <p className="text-text/75 dark:text-text-dark/80 text-sm sm:text-base leading-relaxed">
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Same frame for all steps: tight border, height from content (image or GCal panel). */
const howItWorksVisualFrame =
  'w-full shrink-0 overflow-hidden rounded-xl border border-outline/20 dark:border-gray-600/50 bg-secondary_background dark:bg-gray-800/90 shadow-inner p-0';

export function LandingHowItWorks() {
  const steps = [
    {
      title: 'Create an event',
      body: 'Name it, set your time window, then share the event—copy the link or invite people by email.',
      visual: (
        <img
          src={imgHeroCalendar}
          alt="ymeets new event form and calendar"
          className="block w-full h-auto max-w-full"
        />
      ),
    },
    {
      title: 'Pull in availability with Google Calendar',
      body: 'Connect GCal so your busy times show up instantly—and compare with the rest of the group.',
      visual: (
        <div className="flex w-full flex-col items-center gap-3 px-4 pt-5 pb-4 sm:px-5 sm:pt-6 sm:pb-4 text-center bg-gradient-to-br from-primary/15 via-secondary_background to-background dark:from-primary/25 dark:via-secondary_background-dark dark:to-background-dark">
          <div className="rounded-2xl bg-white dark:bg-white/95 p-3 sm:p-3.5 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
            <img
              src={gcalLogo}
              alt=""
              className="h-12 sm:h-14 w-auto mx-auto"
            />
          </div>
          <div className="max-w-[260px] space-y-1.5">
            <p className="text-sm font-semibold text-text dark:text-text-dark">
              Calendar-connected availability
            </p>
            <p className="text-xs sm:text-sm text-text/75 dark:text-text-dark/80 leading-snug">
              Optional sync—or mark free times by hand. Your grid updates for
              the group either way.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Vote and finalize time & place',
      body: 'See overlapping availability, vote on Yale campus locations, and lock the meeting details everyone agreed on.',
      visual: (
        <img
          src={imgHowItWorksStep3}
          alt="ymeets: group availability and campus location preferences"
          className="block w-full h-auto max-w-full"
        />
      ),
    },
  ];

  return (
    <section
      className={`${sectionShell} py-16 md:py-24 border-t border-outline/20 dark:border-gray-600/40`}
    >
      <h2 className="text-3xl sm:text-4xl font-bold text-text dark:text-text-dark text-center mb-4">
        How it works
      </h2>
      <p className="text-center text-text/75 dark:text-text-dark/80 max-w-2xl mx-auto mb-14 text-lg">
        Three steps from “we should meet” to a booked time and place.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8 lg:items-stretch">
        {steps.map((step, i) => (
          <div key={step.title} className="flex flex-col h-full min-h-0">
            <div className="flex items-center gap-3 mb-3 shrink-0">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white text-sm font-bold shrink-0">
                {i + 1}
              </span>
              <h3 className="font-semibold text-lg text-text dark:text-text-dark leading-snug">
                {step.title}
              </h3>
            </div>
            <p className="text-text/75 dark:text-text-dark/80 text-sm sm:text-base mb-4 leading-relaxed shrink-0 lg:flex-1 lg:min-h-[5rem]">
              {step.body}
            </p>
            <div className={`${howItWorksVisualFrame} mt-auto shrink-0`}>
              {step.visual}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LandingProductDeepDive() {
  return (
    <section
      className={`${sectionShell} py-16 md:py-24 border-t border-outline/20 dark:border-gray-600/40`}
    >
      <div className="max-w-3xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-text dark:text-text-dark mb-4">
          Built for real campus workflows
        </h2>
        <p className="text-text/75 dark:text-text-dark/80 text-lg mb-8 leading-relaxed">
          Dashboard overview, availability grids, and location voting mirror
          what your group actually sees—so you can coordinate fast and move
          on.
        </p>
        <ul className="space-y-4">
          {[
            'Autofill from Google Calendar to avoid re-typing your week',
            'Dashboard and event overview with codes easy to share',
            'Pick and vote on campus meeting spots in one flow',
            'Finalize time and place so everyone has the same details',
          ].map((item) => (
            <li key={item} className="flex gap-3 text-text dark:text-text-dark">
              <IconCalendarEvent
                className="shrink-0 mt-0.5 text-primary dark:text-primary-dark"
                size={20}
              />
              <span className="text-text/85 dark:text-text-dark/90">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function LandingFinalCta({ navigate }: { navigate: NavigateFn }) {
  return (
    <section
      className={`${sectionShell} py-20 md:py-28 border-t border-outline/20 dark:border-gray-600/40`}
    >
      <div className="rounded-3xl border border-outline/25 dark:border-gray-600/60 bg-gradient-to-br from-secondary_background to-background dark:from-secondary_background-dark dark:to-background-dark px-8 py-16 md:px-16 md:py-20 text-center shadow-lg">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text dark:text-text-dark mb-4 max-w-2xl mx-auto">
          Ready to stop scheduling in the group chat?
        </h2>
        <p className="text-text/75 dark:text-text-dark/80 text-lg mb-10 max-w-xl mx-auto">
          Create your first event in under a minute—built for Yale, free to
          use.
        </p>
        <div className="flex justify-center">
          <Button
            bgColor="primary"
            textColor="white"
            onClick={() => navigate('/dayselect')}
            className="!px-10 !py-4 !text-lg"
          >
            Create Event
          </Button>
        </div>
      </div>
    </section>
  );
}
