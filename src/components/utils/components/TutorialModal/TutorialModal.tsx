import { useState, useEffect } from 'react';
import { IconCalendarSmile, IconLink, IconRobotFace, IconX, IconChevronLeft, IconChevronRight, IconCalendar, IconCalendarEvent, IconPencil, IconUserPlus, IconEye } from '@tabler/icons-react';
import step1media from './Meeting.mp4';
import step2media from './EventDetails.png';
import step3media from './SelectDaysTutorial.png';
import step4media from './GeneralDaysTutorial.png';
import step5media from './Share.mp4';
import step6media from './EditAvailable.mp4';
import step7media from './ViewAvailable.mp4';
import step8media from './EventDeletion.mp4';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialSlide {
    id: string;
    title: string;
    description: string;
    icon?: React.ReactNode;
    description2?: string;
    media?: { type: 'video' | 'image'; src: string; alt: string };
    endnote?: string;
}

/* 
adding video:
media: {
    type: 'video',
    src: '___.mp4',  
    alt: 'Step X Demonstration'
  },

adding image/gif:
media: {
    type: 'image',
    src: '___.png',  
    alt: 'Step X Demonstration'
  },


 */

const tutorialSlides: TutorialSlide[] = [
    {
    id: 'welcome',
    title: 'Welcome to ymeets!',
    description: "Thank you for visting our website! In this quick walkthrough, you'll learn how to create & schedule events, share them with others, view availability, and more.",
    icon: <IconRobotFace size={22} stroke={1.5} />,
    endnote: "Let's get started!",
    media: {
    type: 'video',
    src: step1media,  
    alt: 'Step 1 Demonstration'
    },
  },
  {
    id: 'step2',
    title: 'Creating Events',
    description: 'To make an event, you can press the "Create Event" button on the homepage. That takes you to our Day Selection page, where you can freely customize your event name, description, timezone, and location.',
    icon: <IconPencil size={22} stroke={1.5} />,
    media: {
    type: 'image',
    src: step2media,  
    alt: 'Step 2 Demonstration'
    },
  },
  {
    id: 'step3',
    title: 'Selecting Specific Dates',
    description: 'Under the "Specific Days" tab, you can interact with the calendar to freely customize the month, timespan, and specific dates of your event. ',
    icon: <IconCalendar size={22} stroke={1.5} />,
    media: {
    type: 'image',
    src: step3media,  
    alt: 'Step 3 Demonstration'
    },
  },
  {
    id: 'step4',
    title: 'Selecting General Days',
    description: 'If you have a repeating event, you can instead navigate to the "General Days" tab! Here, you can pick a general day and time for your event.',
    icon: <IconCalendarEvent size={22} stroke={1.5} />,
    media: {
    type: 'image',
    src: step4media,  
    alt: 'Step 4 Demonstration'
    },
  },
  {
    id: 'step5',
    title: 'Sharing Events',
    description: "Now, upon pressing the 'Create' button, you'll be guided to your event dashboard! Here, you can share your event by pressing the 'Copy Link' button.",
    icon: <IconLink size={22} stroke={1.5} />,
    media: {
    type: 'video',
    src: step5media,  
    alt: 'Step 5 Demonstration'
    },
    description2: 'Also, if you press the "View Availabilities" button, you can find our "AutoDraft Email" feature which instantly drafts a template email for you to share!',
  },
  {
    id: 'step6',
    title: 'Setting Availability',
    description: 'After receiving the link, your participants can add their availability by pressing the "Edit Availability" button. They can either fill it in manually, or autofill from Google Calendar!',
    icon: <IconUserPlus size={22} stroke={1.5} />,
    media: {
    type: 'video',
    src: step6media,  
    alt: 'Step 6 Demonstration'
    },
  },
  {
    id: 'step7',
    title: 'Scheduling an Event',
    description: "After everyone has filled in their availabilities, you can see when they overlap and select a time that works best! You can also hover over a participant's name to see their specific availability.",
    icon: <IconEye size={22} stroke={1.5} />,
    media: {
    type: 'video',
    src: step7media,  
    alt: 'Step 7 Demonstration'
    },
    description2: "Then, you can schedule the event directly into Google Calendar via the 'Export to GCal' button!",
  },
  {
    id: 'step8',
    title: 'Wrapping Up',
    description: 'Lastly, you can view, delete, and copy the links for all of your created & participated-in events by pressing the "My Events" button in the top right corner.',
    icon: <IconCalendarSmile size={22} stroke={1.5} />,
    endnote: "Thanks for viewing the tutorial! 👋",
    media: {
    type: 'video',
    src: step8media,  
    alt: 'Step 8 Demonstration'
    },
  },
];

export default function TutorialModal({
  isOpen,
  onClose,
}: TutorialProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  const totalSlides = tutorialSlides.length;
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === totalSlides - 1;

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentSlide(0);
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

  const handleNext = () => {
    if (!isLastSlide) {
      setSlideDirection('right');
      setCurrentSlide((prev) => prev + 1);
    } else {
      // Last slide - close modal and mark tutorial as complete
      localStorage.setItem('hasSeenCreatorTutorial', 'true');
      onClose();
    }
  };

  const handlePrevious = () => {
    if (!isFirstSlide) {
      setSlideDirection('left');
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenCreatorTutorial', 'true');
    onClose();
  };

  const currentSlideData = tutorialSlides[currentSlide];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <IconX size={18} stroke={1.5} />
        </button>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <div className="text-blue-600 dark:text-blue-400">
                {currentSlideData.icon}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentSlideData.title}
            </h3>
          </div>

          <p className="text-md text-gray-600 dark:text-gray-300 leading-relaxed">
            {currentSlideData.description}
          </p>

          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden min-h-[200px] flex items-center justify-center">
            {currentSlideData.media ? (
              currentSlideData.media.type === 'video' ? (
                <video 
                  key={currentSlideData.media.src} 
                  autoPlay
                  loop 
                  muted 
                  playsInline
                  className='w-full h-full object-cover'
                  aria-label={currentSlideData.media.alt}
                >
                  <source 
                    src={currentSlideData.media.src} 
                    type="video/mp4"
                  />
                </video>
              ) : (
                <img 
                  src={currentSlideData.media.src} 
                  alt={currentSlideData.media.alt}
                  className='w-full h-full object-cover'
                />
              )
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center p-8">
                [media placeholder]
              </p>
            )}
          </div>

          {currentSlideData.description2 && (
            <p className="text-md text-gray-600 dark:text-gray-300 leading-relaxed pb-1">
              {currentSlideData.description2}
            </p>
          )}

          {currentSlideData.endnote && (
            <p className="text-center text-md text-gray-600 dark:text-gray-300 leading-relaxed pb-1">
              {currentSlideData.endnote}
            </p>
          )}

          <div className="flex justify-center gap-2 pt-2">
            {tutorialSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-blue-600 dark:bg-blue-400 w-6'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={isFirstSlide}
                className={`justify-self-start flex items-center gap-1 px-4 py-2.5 font-medium rounded-lg transition-all whitespace-nowrap ${
                  isFirstSlide
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <IconChevronLeft size={18} />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>

              {!isLastSlide && (
                <button
                  onClick={handleSkip}
                  className="justify-self-center text-center py-2.5 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors whitespace-nowrap"
                >
                  Skip Tutorial
                </button>
              )}
            
            <button
              onClick={handleNext}
              className="col-start-3 justify-self-end flex items-center gap-1 px-4 py-2.5 font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all whitespace-nowrap"
            >
              {isLastSlide ? 'Finish' : 'Next'}
              {!isLastSlide && <IconChevronRight size={18} />}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Step {currentSlide + 1} of {totalSlides}
          </div>

        </div>
      </div>
    </div>
  );
}