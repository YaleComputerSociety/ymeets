import React, { useEffect, useRef } from 'react';
import Select from 'react-dropdown-select';

interface OptionType {
  label: string;
  value: string;
}

interface LimitedInputSelectProps {
  locationOptions: OptionType[];
  updateLocationsState: (values: string[]) => void;
}

// 🔽 Custom arrow that flips when open
const DropdownArrow = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-200 ease-in-out ml-2 ${
      isOpen ? 'rotate-180' : ''
    } text-gray-600 dark:text-gray-300`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const LimitedInputSelect: React.FC<LimitedInputSelectProps> = ({
  locationOptions,
  updateLocationsState,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const input = containerRef.current.querySelector('input');
      if (input) input.maxLength = 39;
    }
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <Select
        className="react-dropdown-select w-full bg-secondary_background dark:bg-secondary_background-dark border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2"
        multi
        create
        options={locationOptions}
        clearOnSelect={false}
        values={[]}
        onChange={(values: OptionType[]) => {
          const selectedValues = values.map((val) => val.value);
          updateLocationsState(selectedValues);
        }}
        placeholder="Location Options (Optional)"
        noDataRenderer={() => (
          <div className="p-2 text-center">No matching preset locations :(</div>
        )}
        dropdownHandleRenderer={(props: any) => (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <DropdownArrow isOpen={props.isOpen} />
          </div>
        )}
      />
    </div>
  );
};

export default LimitedInputSelect;
