import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { IconInfoCircle } from '@tabler/icons-react';

interface Props {
  content: string;
  delay?: number;
  width?: string;
}

export default function InformationPopup({ 
  content, 
  delay = 300,
  width = 'md'
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [popupPosition, setPopupPosition] = useState<'left' | 'right'>('left');

  // Width classes mapped to Tailwind classes
  const widthClasses = {
    'sm': 'w-64',
    'md': 'w-80',
    'lg': 'w-96',
    'xl': 'w-120'
  };
  
  const widthClass = widthClasses[width as keyof typeof widthClasses] || 'w-80';

  // Determine the best position for the popup based on available space
  useEffect(() => {
    if (isVisible && iconRef.current) {
      const iconRect = iconRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Get numeric width value from the width class
      const widthValue = {
        'sm': 256,
        'md': 320,
        'lg': 384,
        'xl': 480
      }[width as keyof typeof widthClasses] || 320;
      
      // If there's not enough space to the left, position to the right instead
      if (iconRect.left < widthValue + 20) {
        setPopupPosition('right');
      } else {
        setPopupPosition('left');
      }
    }
  }, [isVisible, width]);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, delay);
  };

  // Clean up any timers when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="relative inline-block"
      ref={iconRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      <IconInfoCircle
        className="cursor-help"
        size={24}
        color={theme === 'dark' ? '#f8f9fa' : 'black'}
        aria-label="More information"
      />
      
      {/* Popup positioned below and to the left or right based on available space */}
      <div
        ref={popupRef}
        className={`
          absolute top-full mt-2
          ${popupPosition === 'left' ? 'right-0' : 'left-0'}
          bg-black dark:bg-secondary_background-dark
          text-white dark:text-text-dark
          z-50 p-4 rounded-lg shadow-lg
          transition-all duration-300 ${widthClass}
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
        `}
      >
        <div className="text-sm whitespace-normal break-words">{content}</div>
      </div>
    </div>
  );
}