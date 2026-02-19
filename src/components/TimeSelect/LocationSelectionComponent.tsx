import React, { useEffect, useState, useRef } from 'react';
import { IconChevronDown, IconX, IconCheck } from '@tabler/icons-react';

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
  const filteredLocations = locations.filter((location) => location.toLowerCase().includes(inputValue.toLowerCase().trim()));

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (location: string) => {
    const updated = selectedLocations.includes(location)
      ? selectedLocations.filter((loc) => loc !== location)
      : [...selectedLocations, location];
    setSelectedLocations(updated);
    update(updated);
    setInputValue('');
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (create) {
      setInputValue(event.target.value);
      if (event.target.value.trim() && !isOpen) {
        setIsOpen(true);
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
      <div
        className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer"
        onClick={toggleDropdown}
      >
        <div className="flex flex-wrap gap-1 items-center flex-1 min-w-0">
          {selectedLocations.length > 0 ? (
            selectedLocations.map((location) => (
              <span
                key={location}
                className="inline-flex items-center px-1.5 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400 rounded text-xs"
              >
                <span className="truncate max-w-[100px]" title={location}>
                  {location}
                </span>
                <IconX
                  size={12}
                  className="ml-1 cursor-pointer hover:text-primary-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(location);
                  }}
                />
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {placeholder}
            </span>
          )}
        </div>
        <IconChevronDown
          className={`flex-shrink-0 ml-1 transition-transform duration-200 text-gray-500 dark:text-gray-400 ${
            isOpen ? 'rotate-180' : ''
          }`}
          size={16}
        />
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
          {create && (
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type to search or add..."
              className="w-full px-2 py-1.5 text-sm bg-transparent border-b border-gray-200 dark:border-gray-700 outline-none text-gray-700 dark:text-gray-300"
              autoFocus
            />
          )}
          <ul className="max-h-32 overflow-y-auto">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <li
                  key={location}
                  onClick={() => handleSelect(location)}
                  className={`flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer transition-colors ${
                    selectedLocations.includes(location)
                      ? 'bg-primary/10 dark:bg-primary/20 text-gray-700 dark:text-gray-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="truncate">{location}</span>
                  {selectedLocations.includes(location) && (
                    <IconCheck size={14} className="flex-shrink-0 ml-1 text-primary" />
                  )}
                </li>
              ))
            ) : (
              <li className="px-2 py-1.5 text-sm text-gray-400 italic">
                No matching locations
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationSelectionComponent;
