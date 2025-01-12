import {
  IoIosInformationCircleOutline,
  IoMdInformationCircleOutline,
} from 'react-icons/io';
import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
interface Props {
  content: string;
}
export default function InformationPopup({ content }: Props) {
  const [opacity, setOpacity] = useState(0); // State to control opacity
  const { theme } = useTheme();

  return (
    <div className="relative">
      <IoMdInformationCircleOutline
        onMouseEnter={() => {
          setOpacity(1);
        }} // Set opacity to 1 on mouse enter
        onMouseLeave={() => {
          setOpacity(0);
        }}
        className="cursor-pointer"
        size={24}
        color={theme == 'dark' ? '#f8f9fa' : 'black'}
      />
      <div
        className={`absolute bg-black dark:bg-secondary_background-dark text-white dark:text-text-dark  z-10 p-2 rounded-lg transition-opacity duration-500 ${
          opacity ? 'opacity-100' : 'opacity-0'
        } pointer-events-none max-w-xs w-auto`}
        style={{ transitionDelay: `${opacity ? '0ms' : '1000ms'}` }}
      >
        {content}
      </div>
    </div>
  );
}
