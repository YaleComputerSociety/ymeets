import React, { useState, useRef, useEffect } from 'react';
import { IconChevronDown, IconX, IconCheck } from '@tabler/icons-react';
import './locationSelectionComponent.css';

interface LocationSelectionProps {
  locations: string[];
  update: (selected: string[]) => void;
  create?: boolean; // Allow custom locations
  placeholder?: string;
  className?: string;
}

const LocationSelectionComponent: React.FC<LocationSelectionProps> = ({
  locations,
  update,
  create = false,
  placeholder = 'Select preferred location(s)',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (location: string) => {
    const updated = selectedLocations.includes(location)
      ? selectedLocations.filter((loc) => loc !== location)
      : [...selectedLocations, location];
    setSelectedLocations(updated);
    update(updated);
  };

  const handleRemove = (location: string) => {
    const updated = selectedLocations.filter((loc) => loc !== location);
    setSelectedLocations(updated);
    update(updated);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && inputValue.trim() && create) {
      event.preventDefault();
      if (
        !locations.includes(inputValue.trim()) &&
        !selectedLocations.includes(inputValue.trim())
      ) {
        const newLocation = inputValue.trim();
        const updated = [...selectedLocations, newLocation];
        setSelectedLocations(updated);
        update(updated);
        setInputValue('');
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedLocations.map((location) => (
          <div
            key={location}
            className="flex items-center px-3 py-1 bg-primary dark:bg-primary-600 text-white rounded-full shadow-md"
          >
            <span className="mr-2">{location}</span>
            <IconX
              size={16}
              className="cursor-pointer hover:text-gray-200 transition-colors"
              onClick={() => handleRemove(location)}
            />
          </div>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => create && setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-secondary_background-dark text-gray-900 dark:text-white ${
            !create ? 'cursor-pointer' : ''
          }`}
          onClick={() => setIsOpen(!isOpen)} // Replace onFocus with onClick
          readOnly={!create}
        />
        <IconChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-300 
                     text-black dark:text-white cursor-pointer ${
                       isOpen ? 'rotate-180' : 'rotate-0'
                     }`}
          size={20}
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>
      {isOpen && (
        <ul
          className="absolute z-50 w-full max-h-60 mt-1 overflow-y-auto 
                      bg-white dark:bg-secondary_background-dark 
                      border border-gray-300 dark:border-gray-600 
                      rounded-lg shadow-lg 
                      scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 
                      scrollbar-track-gray-200 dark:scrollbar-track-gray-800"
        >
          {locations.map((location) => (
            <li
              key={location}
              onClick={() => handleSelect(location)}
              className={`p-2 text-gray-900 dark:text-white cursor-pointer flex justify-between items-center
                         ${
                           selectedLocations.includes(location)
                             ? 'bg-gray-200 dark:bg-gray-600 font-semibold'
                             : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                         }`}
            >
              <span>{location}</span>
              {selectedLocations.includes(location) && (
                <IconCheck size={18} className="text-black dark:text-white" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSelectionComponent;
