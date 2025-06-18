import React, { useState, useEffect, useRef } from 'react';
import { IconChevronDown } from '@tabler/icons-react'; // Import Tabler icon

interface DropdownProps<T> {
  options: T[];
  selectedOption: T;
  onSelect: (option: T) => void;
  placeholder?: string;
  renderOption?: (option: T) => React.ReactNode;
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  getSearchableText?: (option: T) => string;
}

function Dropdown<T>({
  options,
  selectedOption,
  onSelect,
  placeholder = 'Select an option',
  renderOption,
  className = '',
  searchable = false,
  searchPlaceholder = 'Search...',
  getSearchableText,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (option: T) => {
    onSelect(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (newIsOpen && searchable) {
      // Focus the search input when opening
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }

    if (!newIsOpen) {
      setSearchTerm('');
    }
  };

  // Filter options based on search term
  const filteredOptions =
    searchable && searchTerm
      ? options.filter((option) => {
          const searchText = getSearchableText
            ? getSearchableText(option)
            : renderOption
              ? String(renderOption(option)).toLowerCase()
              : String(option).toLowerCase();
          return searchText.toLowerCase().includes(searchTerm.toLowerCase());
        })
      : options;

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
    <div className={`relative w-full`} ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={`w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-left flex items-center justify-between ${className}`}
      >
        <span>
          {selectedOption
            ? renderOption
              ? renderOption(selectedOption)
              : String(selectedOption)
            : placeholder}
        </span>
        <IconChevronDown
          className={`transition-transform duration-300 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          size={20}
        />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full bg-white dark:bg-secondary_background-dark border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          {searchable && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <ul className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
            {filteredOptions.length === 0 ? (
              <li className="p-2 text-gray-500 dark:text-gray-400 text-center">
                No options found
              </li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={index}
                  onClick={() => handleSelect(option)}
                  className={`p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                    option === selectedOption
                      ? 'bg-gray-200 dark:bg-gray-600 font-semibold'
                      : ''
                  }`}
                >
                  {renderOption ? renderOption(option) : String(option)}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Dropdown;
