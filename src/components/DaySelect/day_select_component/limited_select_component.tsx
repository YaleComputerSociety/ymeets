import React, { useEffect, useRef } from "react";
import Select from "react-dropdown-select";

interface OptionType {
  label: string;
  value: string;
}

interface LimitedInputSelectProps {
  locationOptions: OptionType[];
  updateLocationsState: (values: string[]) => void;
}

const LimitedInputSelect: React.FC<LimitedInputSelectProps> = ({
  locationOptions,
  updateLocationsState,
}) => {
  // Create ref for the wrapping container div
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Query the input element within the Select container
      const input = containerRef.current.querySelector("input");
      if (input) {
        // Seletct length to prevent input
        // window streching on the smallest window size
        input.maxLength = 39;
      }
    }
  }, []);

  return (
    // Original Select component
    <div ref={containerRef}>
      <Select
        className="react-dropdown-select z-69 bg-secondary_background dark:bg-secondary_background-dark"
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
          <div className="p-2 text-center">
            No matching preset locations :(
          </div>
        )}
        onDropdownOpen={() => {
          const handle = document.querySelector(
            ".react-dropdown-select-dropdown-handle"
          );
          if (handle) handle.classList.add("open");
        }}
        onDropdownClose={() => {
          const handle = document.querySelector(
            ".react-dropdown-select-dropdown-handle"
          );
          if (handle) handle.classList.remove("open");
        }}
      />
    </div>
  );
};

export default LimitedInputSelect;
