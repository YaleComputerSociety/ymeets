import { useState, useEffect } from 'react';
import { IconX, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import stock_meeting_gif from './Meeting.mp4';
import day_select_pic from './DaySelect-dark.png';
import copy_link_gif from './Share.mp4';
import group_view_vid from './ViewAvailable.mp4';
import delete_vid from './EventDeletion.mp4';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialSlide {
  id: string;
  title: string;
  description: string;
  media: { type: 'video' | 'image'; src: string; alt: string };
}

const tutorialSlides: TutorialSlide[] = [
  {
    id: 'welcome',
    title: 'Welcome to ymeets',
    description:
      'The easiest way to find a time that works for everyone. Let us show you how it works.',
    media: { type: 'video', src: stock_meeting_gif, alt: 'ymeets overview' },
  },
  {
    id: 'create',
    title: 'Create Your Event',
    description:
      'Name your event, set the timezone, and pick your dates. Choose specific calendar days or recurring days of the week.',
    media: { type: 'image', src: day_select_pic, alt: 'Date selection' },
  },
  {
    id: 'share',
    title: 'Share and Invite',
    description:
      'Copy your event link to share. Participants can add availability manually or sync directly from Google Calendar.',
    media: { type: 'video', src: copy_link_gif, alt: 'Sharing event' },
  },
  {
    id: 'schedule',
    title: 'Find the Perfect Time',
    description:
      'See when everyone is free at a glance. Hover over names for details, then export your meeting to Google Calendar.',
    media: { type: 'video', src: group_view_vid, alt: 'Viewing availability' },
  },
  {
    id: 'done',
    title: "You're All Set!",
    description:
      'Access all your events from "My Events" in the navigation. Happy scheduling!',
    media: { type: 'video', src: delete_vid, alt: 'My Events' },
  },
];

export default function TutorialModal({ isOpen, onClose }: TutorialProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  const totalSlides = tutorialSlides.length;
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === totalSlides - 1;
  const currentSlideData = tutorialSlides[currentSlide];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentSlide(0);
      setMediaLoaded(false);
      document.body.style.overflow = 'hidden';
      setTimeout(() => setIsAnimating(true), 10);
    } else if (isVisible) {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible]);

  // Reset media loaded state when slide changes
  useEffect(() => {
    setMediaLoaded(false);
  }, [currentSlide]);

  const handleNext = () => {
    if (!isLastSlide) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      localStorage.setItem('hasSeenCreatorTutorial', 'true');
      onClose();
    }
  };

  const handlePrevious = () => {
    if (!isFirstSlide) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem('hasSeenCreatorTutorial', 'true');
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-[560px] w-full shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-5'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Close tutorial"
        >
          <IconX size={20} stroke={1.5} />
        </button>

        {/* Media container */}
        <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden">
          {/* Loading skeleton */}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-shimmer transition-opacity duration-300 ${
              mediaLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* Media content */}
          {currentSlideData.media.type === 'video' ? (
            <video
              key={currentSlideData.id}
              autoPlay
              loop
              muted
              playsInline
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                mediaLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoadedData={() => setMediaLoaded(true)}
              aria-label={currentSlideData.media.alt}
            >
              <source src={currentSlideData.media.src} type="video/mp4" />
            </video>
          ) : (
            <img
              key={currentSlideData.id}
              src={currentSlideData.media.src}
              alt={currentSlideData.media.alt}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                mediaLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setMediaLoaded(true)}
            />
          )}
        </div>

        {/* Text content */}
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-6">
          {currentSlideData.title}
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed mt-2">
          {currentSlideData.description}
        </p>

        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-full mt-6 overflow-hidden">
          <div
            className="h-full bg-primary dark:bg-primary-dark rounded-full transition-all duration-400 ease-out"
            style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-5">
          <button
            onClick={handlePrevious}
            disabled={isFirstSlide}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
              isFirstSlide
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <IconChevronLeft size={18} />
            Back
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
          >
            {isLastSlide ? 'Get Started' : 'Continue'}
            {!isLastSlide && <IconChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
