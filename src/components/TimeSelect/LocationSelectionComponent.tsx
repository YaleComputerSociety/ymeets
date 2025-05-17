import React, { useEffect, useState, useRef } from 'react';
import Select from 'react-dropdown-select';
import { getAccountName, getLocationVotesByName } from '../../backend/events';
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
  placeholder = 'Select preferred locations',
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
      <div className="relative">
        <div className="flex flex-wrap gap-2 items-center p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-secondary_background-dark">
          {selectedLocations.map((location) => (
            <div
              key={location}
              className="flex items-center px-3 py-1 bg-primary dark:bg-primary-600 text-white rounded-full shadow-md"
            >
              <span title={location} className="mr-2 truncate max-w-[150px]">{location}</span>
              <IconX
                size={16}
                className="cursor-pointer hover:text-gray-200 transition-colors"
                onClick={() => handleRemove(location)}
              />
            </div>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => create && setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedLocations.length == 0 ? placeholder : ''}
            className={`flex-grow min-w-[150px] p-1 bg-transparent outline-none text-gray-900 dark:text-white ${
              !create ? 'cursor-pointer' : ''
            }`}
            onClick={() => setIsOpen(!isOpen)}
            readOnly={!create}
          />
          <IconChevronDown
            className={`ml-auto transition-transform duration-300 text-black dark:text-white cursor-pointer ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
            size={20}
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
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
