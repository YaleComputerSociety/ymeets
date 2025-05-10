import React, { useState, useEffect, useRef } from 'react';
import { IconChevronDown } from '@tabler/icons-react'; // Import Tabler icon

interface DropdownProps<T> {
  options: T[];
  selectedOption: T;
  onSelect: (option: T) => void;
  placeholder?: string;
  renderOption?: (option: T) => React.ReactNode;
  className?: string;
}

function Dropdown<T>({
  options,
  selectedOption,
  onSelect,
  placeholder = 'Select an option',
  renderOption,
  className = '',
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: T) => {
    onSelect(option);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
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
    <div className={`relative w-full`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
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
        <ul className="absolute z-50 w-full max-h-60 overflow-y-auto bg-white dark:bg-secondary_background-dark border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
          {options.map((option, index) => (
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
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dropdown;
